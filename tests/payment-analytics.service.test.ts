import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import { PaymentAnalyticsService } from "@/infrastructure/external/payment-analytics.service.ts";

describe("PaymentAnalyticsService", () => {
	let mockLogger: jest.Mocked<ILogger>;
	let service: PaymentAnalyticsService;
	let axiosGetSpy: ReturnType<typeof jest.spyOn>;

	const { privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" },
	});

	beforeEach(() => {
		jest.clearAllMocks();
		axiosGetSpy = jest.spyOn(axios, "get");
		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;
		service = new PaymentAnalyticsService(
			mockLogger,
			"http://test-payment-service:3003",
			"restaurant-service",
			"payment-service",
			privateKey,
		);
	});

	describe("getSubscriptionSummary", () => {
		it("should call internal subscription summary endpoint and map response correctly", async () => {
			const mockResponse = {
				success: true,
				data: {
					activeSubscribedRestaurants: 118,
					currentMrrRupees: 245000,
					currentArrRupees: 2940000,
					grossSubscriptionRevenueRupees: 245000,
					growthPercentage: 14.2,
					subscriptionTierDistribution: {
						QUEUE_PRO: 88,
						ENTERPRISE: 30,
					},
					timeline: [
						{
							bucketLabel: "Week 1",
							grossRevenueRupees: 65000,
							mrrRupees: 58000,
							newSubscriptionsCount: 12,
						},
					],
				},
			};

			axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

			const query = {
				period: "MONTH" as const,
				month: 11,
				year: 2026,
				billingCycle: "ALL" as const,
			};

			const result = await service.getSubscriptionSummary(
				query,
				"admin-user-123",
			);

			expect(axiosGetSpy).toHaveBeenCalledWith(
				"http://test-payment-service:3003/api/internal/v1/analytics/subscriptions/summary",
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: "application/json",
						"X-Caller-Service": "restaurant-service",
						Authorization: expect.stringMatching(/^Bearer /),
						"x-user-id": "admin-user-123",
						"x-user-role": "admin",
					}),
					params: {
						period: "MONTH",
						day: undefined,
						month: 11,
						year: 2026,
						billingCycle: "ALL",
					},
				}),
			);

			expect(result).toEqual(mockResponse.data);
		});

		it("should return null and log warning when API returns malformed data", async () => {
			// Missing required numeric fields in data
			const malformedResponse = {
				success: true,
				data: {
					activeSubscribedRestaurants: "not-a-number", // should be number
				},
			};

			axiosGetSpy.mockResolvedValueOnce({ data: malformedResponse } as never);

			const result = await service.getSubscriptionSummary();
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					rawData: malformedResponse.data,
				}),
				"Payment service returned malformed subscription summary schema",
			);
		});

		it("should return null and log warning when API returns unsuccessful response", async () => {
			axiosGetSpy.mockResolvedValueOnce({
				data: { success: false, data: null },
			} as never);

			const result = await service.getSubscriptionSummary();
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});

		it("should return null and log warning when network request throws", async () => {
			axiosGetSpy.mockRejectedValueOnce(new Error("Connection timeout"));

			const result = await service.getSubscriptionSummary();
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});

		it("should not treat HTTP 401/403 as a service outage failure in circuit breaker", async () => {
			const authError = new Error("Forbidden");
			(authError as unknown as { response: { status: number } }).response = {
				status: 403,
			};

			// 5 consecutive 403 errors
			for (let i = 0; i < 5; i++) {
				axiosGetSpy.mockRejectedValueOnce(authError);
				await service.getSubscriptionSummary();
			}

			// Next call should still dispatch network request (breaker not tripped)
			axiosGetSpy.mockResolvedValueOnce({
				data: {
					success: true,
					data: {
						activeSubscribedRestaurants: 1,
						currentMrrRupees: 1000,
						currentArrRupees: 12000,
						grossSubscriptionRevenueRupees: 1000,
						subscriptionTierDistribution: { PRO: 1 },
						timeline: [],
					},
				},
			} as never);

			const nextResult = await service.getSubscriptionSummary();
			expect(nextResult).not.toBeNull();
			expect(axiosGetSpy).toHaveBeenCalledTimes(6);
		});

		it("should trip circuit breaker after 5 consecutive 5xx/network errors and stop dispatching HTTP requests", async () => {
			const serverError = new Error("Internal Server Error 500");
			(serverError as unknown as { response: { status: number } }).response = {
				status: 500,
			};

			// 5 consecutive 500 errors
			for (let i = 0; i < 5; i++) {
				axiosGetSpy.mockRejectedValueOnce(serverError);
				await service.getSubscriptionSummary();
			}

			expect(axiosGetSpy).toHaveBeenCalledTimes(5);

			// 6th call should fast-fail without calling axios.get
			const resultWhenOpen = await service.getSubscriptionSummary();
			expect(resultWhenOpen).toBeNull();
			expect(axiosGetSpy).toHaveBeenCalledTimes(5); // Still 5! No HTTP dispatch when OPEN
		});
	});
});
