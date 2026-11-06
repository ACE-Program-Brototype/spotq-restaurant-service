import "reflect-metadata";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { PlatformDashboardAnalyticsResponseDto } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
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

	const mockResponseDto: PlatformDashboardAnalyticsResponseDto = {
		overview: {
			totalRestaurants: 100,
			activeSubscribedRestaurants: 80,
			mrrRupees: 200000,
			totalDinersServedToday: 0,
			subscriptionTierDistribution: { PRO: 60, ENTERPRISE: 20 },
			onboardingTrend: [{ period: "2026-10", count: 20 }],
		},
		revenue: {
			currentMrrRupees: 200000,
			currentArrRupees: 2400000,
			grossRevenueYearToDateRupees: 0,
			monthlyTimeline: [],
		},
		growth: {
			funnel: [{ stage: "REGISTERED", count: 100 }],
			geographicBreakdown: [
				{ city: "Bengaluru", state: "Karnataka", restaurantCount: 50 },
			],
		},
		filters: {
			from: null,
			to: null,
			billingCycle: "ALL",
			fiscalYear: null,
		},
		generatedAt: "2026-11-06T12:00:00.000Z",
	};

	beforeEach(() => {
		useCase = {
			execute: jest.fn<IGetPlatformDashboardAnalyticsUseCase["execute"]>().mockResolvedValue(mockResponseDto),
		};

		controller = new AdminDashboardAnalyticsController(useCase);

		res = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn();
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

		expect(useCase.execute).toHaveBeenCalledWith(query, "admin-123");
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

	it("should fallback to req.userId when req.user is undefined", async () => {
		req = {
			userId: "admin-fallback-789",
		};
		res.locals = {
			query: { billingCycle: "MONTHLY" },
		};

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith(
			{ billingCycle: "MONTHLY" },
			"admin-fallback-789",
		);
		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
	});

	it("should fallback to req.query if res.locals.query is missing", async () => {
		req = {
			query: { billingCycle: "YEARLY" } as never,
			user: {
				userId: "admin-456",
				email: "admin@spotq.com",
				role: "admin",
			} as never,
		};
		res.locals = {};

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith(
			{ billingCycle: "YEARLY" },
			"admin-456",
		);
	});

	it("should pass error to next when use case execution throws", async () => {
		const error = new Error("Database query execution failed");
		useCase.execute.mockRejectedValue(error);

		req = {};
		res.locals = {};

		await controller.getDashboardAnalytics(
			req as Request,
			res as Response,
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});
});
