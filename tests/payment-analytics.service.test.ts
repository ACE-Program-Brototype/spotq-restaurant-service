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
				saasSubscriptionArrPaise: "225600000",
				grossRevenueYearToDatePaise: "35000000",
				monthlyTimeline: [
					{ period: "2026-10", revenuePaise: "15000000" },
					{ period: "2026-11", revenuePaise: "20000000" },
				],
				activeVenuesCount: 94,
			},
		};

		axiosGetSpy.mockResolvedValueOnce({ data: mockResponse } as never);

		const query = {
			billingCycle: "MONTHLY" as const,
			fiscalYear: 2026,
		};

		const result = await service.getFinanceSummary(query, "admin-user-123");

		expect(axiosGetSpy).toHaveBeenCalledWith(
			"http://test-payment-service:3003/admin/finance/summary",
			expect.objectContaining({
				headers: expect.objectContaining({
					Accept: "application/json",
					"X-Caller-Service": "restaurant-service",
					Authorization: expect.stringMatching(/^Bearer /),
					"x-user-id": "admin-user-123",
					"x-user-role": "admin",
				}),
				params: {
					billingCycle: "MONTHLY",
					fiscalYear: 2026,
					from: undefined,
					to: undefined,
				},
			}),
		);

		expect(result).toEqual({
			currentMrrRupees: 188000,
			currentArrRupees: 2256000,
			grossRevenueYearToDateRupees: 350000,
			monthlyTimeline: [
				{ month: "2026-10", grossRevenueRupees: 150000 },
				{ month: "2026-11", grossRevenueRupees: 200000 },
			],
			activeVenuesCount: 94,
			todayTurnoverRupees: 25000,
		});
	});

	it("should map missing optional metrics to null instead of fabricating zeroes", async () => {
		const mockBaselineResponse = {
			success: true,
			data: {
				currency: "INR",
				masterBalancePaise: "5000000",
			},
		};

		axiosGetSpy.mockResolvedValueOnce({ data: mockBaselineResponse } as never);

		const result = await service.getFinanceSummary();

		expect(result).toEqual({
			currentMrrRupees: null,
			currentArrRupees: null,
			grossRevenueYearToDateRupees: null,
			monthlyTimeline: [],
			activeVenuesCount: null,
			todayTurnoverRupees: null,
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
