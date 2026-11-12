import "reflect-metadata";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { PlatformDashboardAnalyticsOutputDTO } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { AdminDashboardAnalyticsController } from "@/presentation/http/controllers/admin-dashboard-analytics.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AdminDashboardAnalyticsController", () => {
	let useCase: jest.Mocked<IGetPlatformDashboardAnalyticsUseCase>;
	let controller: AdminDashboardAnalyticsController;
	let req: Partial<Request> & { userId?: string };
	let res: Partial<Response>;
	let next: jest.MockedFunction<NextFunction>;

	const mockResponseDto: PlatformDashboardAnalyticsOutputDTO = {
		overview: {
			totalRestaurants: 100,
			activeSubscribedRestaurants: 80,
			subscriptionTierDistribution: {
				PRO: 60,
				ENTERPRISE: 20,
			},
		},
		customerGrowth: {
			status: "AVAILABLE",
			totalRegisteredCustomers: 12500,
			newCustomersInPeriod: 48,
		},
		revenue: {
			status: "AVAILABLE",
			grossSubscriptionRevenueRupees: 200000,
			currentMrrRupees: 200000,
			currentArrRupees: 2400000,
			growthPercentage: 14.2,
			timeline: [],
		},
		growth: {
			onboardingFunnel: [
				{
					stage: "REGISTERED",
					count: 100,
					label: "Registered & Email Verified",
				},
			],
			onboardingTrend: [{ period: "2026-10", count: 20 }],
		},
		filters: {
			period: "MONTH",
			day: null,
			month: 11,
			year: 2026,
			billingCycle: "ALL",
			from: null,
			to: null,
		},
		generatedAt: "2026-11-06T12:00:00.000Z",
	};

	beforeEach(() => {
		useCase = {
			execute: jest
				.fn<IGetPlatformDashboardAnalyticsUseCase["execute"]>()
				.mockResolvedValue(mockResponseDto),
		};

		controller = new AdminDashboardAnalyticsController(useCase);

		res = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should return 200 with dashboard analytics on success", async () => {
		const query = {
			from: "2026-01-01T00:00:00.000Z",
			to: "2026-10-31T23:59:59.999Z",
			billingCycle: "ALL" as const,
		};

		req = {
			user: {
				userId: "admin-123",
				email: "admin@spotq.com",
				role: "superadmin",
			} as never,
		};
		res.locals = { query };

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith(query);
		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: HTTP_STATUS.OK,
				message: messages.PLATFORM_DASHBOARD_ANALYTICS_FETCHED,
				data: mockResponseDto,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should pass query params correctly when executing use case", async () => {
		res.locals = {
			query: { billingCycle: "MONTHLY" },
		};

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith({
			billingCycle: "MONTHLY",
		});
		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
	});

	it("should fallback to req.query if res.locals.query is missing", async () => {
		req = {
			query: { billingCycle: "YEARLY" } as never,
		};
		res.locals = {};

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith({
			billingCycle: "YEARLY",
		});
	});

	it("should propagate error when use case execution throws in Express 5", async () => {
		const error = new Error("Database query execution failed");
		useCase.execute.mockRejectedValue(error);

		req = {};
		res.locals = {};

		await expect(
			controller.getDashboardAnalytics(req as Request, res as Response),
		).rejects.toThrow("Database query execution failed");

		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});
});
