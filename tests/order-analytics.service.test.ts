import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import { OrderAnalyticsService } from "@/infrastructure/external/order-analytics.service.ts";

describe("OrderAnalyticsService", () => {
	let mockLogger: jest.Mocked<ILogger>;
	let service: OrderAnalyticsService;
	let axiosGetSpy: ReturnType<typeof jest.spyOn>;

	const { privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" },
	});

	const restaurantId = "rest-uuid-9999-0000";

	beforeEach(() => {
		jest.clearAllMocks();
		axiosGetSpy = jest.spyOn(axios, "get");
		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;
		service = new OrderAnalyticsService(
			mockLogger,
			"http://test-order-service:3002",
			"restaurant-service",
			"order-service",
			privateKey,
		);
	});

	describe("getOrderSummary", () => {
		it("should call internal order summary endpoint and map response correctly", async () => {
			const mockResponse = {
				success: true,
				data: {
					restaurantId,
					revenue: {
						netSalesRupees: 185000,
						discountRupees: 15000,
						totalBillAmountRupees: 200000,
						growthPercentage: 12.5,
					},
					orders: {
						totalOrderCount: 450,
						dineInCount: 320,
						takeawayCount: 130,
						growthPercentage: 8.2,
					},
					operations: {
						dinersServedCount: 920,
						uniqueCustomersCount: 380,
					},
					orderStatusBreakdown: {
						totalOrdersTracked: 450,
						distribution: [
							{
								status: "COMPLETED",
								count: 420,
								percentage: 93.33,
								amountRupees: 190000,
							},
						],
					},
				},
			};

			axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

			const result = await service.getOrderSummary(
				restaurantId,
				{
					interval: "MONTH",
					month: 11,
					year: 2026,
					status: "ALL",
				},
				"owner-user-123",
			);

			expect(axiosGetSpy).toHaveBeenCalledWith(
				`http://test-order-service:3002/api/internal/v1/restaurants/${restaurantId}/analytics/orders/summary`,
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: "application/json",
						"X-Caller-Service": "restaurant-service",
						Authorization: expect.stringMatching(/^Bearer /),
						"x-user-id": "owner-user-123",
					}),
					params: {
						interval: "MONTH",
						day: undefined,
						month: 11,
						year: 2026,
						status: "ALL",
					},
				}),
			);

			expect(result).toEqual(mockResponse.data);
		});

		it("should return null and log warning when API returns unsuccessful response", async () => {
			axiosGetSpy.mockResolvedValueOnce({
				data: { success: false, data: null },
			} as never);

			const result = await service.getOrderSummary(restaurantId);
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});

		it("should return null and log warning when network request throws", async () => {
			axiosGetSpy.mockRejectedValueOnce(new Error("Connection timeout"));

			const result = await service.getOrderSummary(restaurantId);
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});
	});

	describe("getProductAnalytics", () => {
		it("should call internal product analytics endpoint and map response correctly", async () => {
			const mockResponse = {
				success: true,
				data: {
					restaurantId,
					totalProductsSold: 5,
					topSelling: {
						items: [],
						pagination: {
							totalItems: 0,
							totalPages: 0,
							currentPage: 1,
							limit: 10,
							hasNextPage: false,
							hasPrevPage: false,
						},
					},
					slowMoving: {
						items: [],
						pagination: {
							totalItems: 0,
							totalPages: 0,
							currentPage: 1,
							limit: 10,
							hasNextPage: false,
							hasPrevPage: false,
						},
					},
				},
			};

			axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

			const result = await service.getProductAnalytics(
				restaurantId,
				{
					interval: "MONTH",
					page: 1,
					limit: 10,
				},
				"owner-user-123",
			);

			expect(axiosGetSpy).toHaveBeenCalledWith(
				`http://test-order-service:3002/api/internal/v1/restaurants/${restaurantId}/analytics/orders/products`,
				expect.objectContaining({
					params: {
						interval: "MONTH",
						day: undefined,
						month: undefined,
						year: undefined,
						page: 1,
						limit: 10,
					},
				}),
			);

			expect(result).toEqual(mockResponse.data);
		});
	});
});
