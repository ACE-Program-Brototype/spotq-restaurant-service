import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import { UserAnalyticsService } from "@/infrastructure/external/user-analytics.service.ts";

describe("UserAnalyticsService", () => {
	let mockLogger: jest.Mocked<ILogger>;
	let service: UserAnalyticsService;
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
		service = new UserAnalyticsService(
			mockLogger,
			"http://test-user-service:3001",
			"restaurant-service",
			"user-service",
			privateKey,
		);
	});

	describe("getUserSummary", () => {
		it("should call internal user summary endpoint and map response correctly", async () => {
			const mockResponse = {
				success: true,
				data: {
					totalRegisteredCustomers: 12500,
					newCustomersInPeriod: 48,
				},
			};

			axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

			const query = {
				period: "MONTH" as const,
				month: 11,
				year: 2026,
			};

			const result = await service.getUserSummary(query, "admin-user-123");

			expect(axiosGetSpy).toHaveBeenCalledWith(
				"http://test-user-service:3001/api/internal/v1/analytics/users/summary",
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
					},
				}),
			);

			expect(result).toEqual({
				totalRegisteredCustomers: 12500,
				newCustomersInPeriod: 48,
			});
		});

		it("should return null and log warning when API returns unsuccessful response", async () => {
			axiosGetSpy.mockResolvedValueOnce({
				data: { success: false, data: null },
			} as never);

			const result = await service.getUserSummary();
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});

		it("should return null and log warning when network request throws", async () => {
			axiosGetSpy.mockRejectedValueOnce(new Error("Connection refused"));

			const result = await service.getUserSummary();
			expect(result).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalled();
		});
	});
});
