import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import { PaymentAnalyticsService } from "@/infrastructure/external/payment-analytics.service.ts";
import axios from "axios";

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
		};
		service = new PaymentAnalyticsService(
			mockLogger,
			"http://test-payment-service:3003",
			"restaurant-service",
			"payment-service",
			privateKey,
		);
	});

	it("should call payment summary endpoint using S2S headers and convert paise to rupees accurately", async () => {
		const mockResponse = {
			success: true,
			data: {
				currency: "INR",
				masterBalancePaise: "5000000",
				todayTurnoverPaise: "2500000",
				tonightEodPayoutQueuePaise: "0",
				lifetimeDisbursedPaise: "120000000",
				totalRefundsProcessedPaise: "0",
				saasSubscriptionMrrPaise: "18800000",
				activeVenuesCount: 94,
			},
		};

		axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

		const result = await service.getFinanceSummary("admin-user-123");

		expect(axiosGetSpy).toHaveBeenCalledWith(
			"http://test-payment-service:3003/admin/finance/summary",
			expect.objectContaining({
				method: "GET",
				headers: expect.objectContaining({
					Accept: "application/json",
					"X-Caller-Service": "restaurant-service",
					Authorization: expect.stringMatching(/^Bearer /),
					"x-user-id": "admin-user-123",
					"x-user-role": "admin",
				}),
			}),
		);

		expect(result).toEqual({
			currentMrrRupees: 188000,
			currentArrRupees: 2256000,
			activeVenuesCount: 94,
			todayTurnoverRupees: 25000,
		});
	});

	it("should return null and log warning when payment service returns unsuccessful response", async () => {
		axiosGetSpy.mockResolvedValueOnce({
			data: {
				success: false,
			},
		} as never);

		const result = await service.getFinanceSummary();

		expect(result).toBeNull();
		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ response: { success: false } }),
			"Payment service returned unsuccessful summary response",
		);
	});

	it("should catch connection failure gracefully, log warning and return null", async () => {
		axiosGetSpy.mockRejectedValueOnce(new Error("Connection refused"));

		const result = await service.getFinanceSummary();

		expect(result).toBeNull();
		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ error: expect.any(Error) }),
			"Failed to fetch finance summary from payment-service",
		);
	});
});
