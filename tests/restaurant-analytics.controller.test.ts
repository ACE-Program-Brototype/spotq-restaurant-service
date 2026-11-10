import "reflect-metadata";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { RestaurantAnalyticsDashboardResponseDto } from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { RestaurantAnalyticsController } from "@/presentation/http/controllers/restaurant-analytics.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantAnalyticsController", () => {
	let useCase: jest.Mocked<IGetRestaurantAnalyticsDashboardUseCase>;
	let controller: RestaurantAnalyticsController;
	let req: Partial<Request> & { userId?: string };
	let res: Partial<Response>;
	let next: jest.MockedFunction<NextFunction>;

	const restaurantId = "11111111-2222-3333-4444-555555555555";

	const mockResponseDto: RestaurantAnalyticsDashboardResponseDto = {
		restaurantId,
		overview: {
			revenue: {
				status: "AVAILABLE",
				netSalesRupees: 185000,
				discountRupees: 15000,
				totalBillAmountRupees: 200000,
				growthPercentage: 12.5,
			},
			orders: {
				status: "AVAILABLE",
				totalOrderCount: 450,
				dineInCount: 320,
				takeawayCount: 130,
				growthPercentage: 8.2,
			},
			operations: {
				status: "AVAILABLE",
				dinersServedCount: 920,
				uniqueCustomersCount: 380,
			},
		},
		orderStatusBreakdown: {
			status: "AVAILABLE",
			totalOrdersTracked: 450,
			distribution: [],
		},
		products: {
			status: "AVAILABLE",
			totalProductsCount: 10,
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
		filters: {
			interval: "MONTH",
			day: null,
			month: 11,
			year: 2026,
			status: "ALL",
			page: 1,
			limit: 10,
		},
		generatedAt: new Date().toISOString(),
	};

	beforeEach(() => {
		useCase = {
			execute: jest
				.fn<IGetRestaurantAnalyticsDashboardUseCase["execute"]>()
				.mockResolvedValue(mockResponseDto),
		};

		controller = new RestaurantAnalyticsController(useCase);

		res = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should return 200 with restaurant dashboard analytics on success", async () => {
		const query = {
			interval: "MONTH" as const,
			year: 2026,
			month: 11,
		};

		req = {
			params: { restaurantId },
			user: {
				userId: "owner-123",
				restaurantId,
				email: "owner@spotq.com",
				role: "RESTAURANT_OWNER",
			} as never,
		};
		res.locals = {
			params: { restaurantId },
			query,
		};

		await controller.getRestaurantAnalyticsDashboard(
			req as Request,
			res as Response,
			next,
		);

		expect(useCase.execute).toHaveBeenCalledWith(
			{ restaurantId, ...query },
			"owner-123",
		);
		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: HTTP_STATUS.OK,
				message: messages.RESTAURANT_ANALYTICS_DASHBOARD_FETCHED,
				data: mockResponseDto,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should catch errors and delegate to next", async () => {
		const error = new Error("Downstream service failure");
		useCase.execute.mockRejectedValueOnce(error);

		req = { params: { restaurantId } };
		res.locals = { params: { restaurantId } };

		await controller.getRestaurantAnalyticsDashboard(
			req as Request,
			res as Response,
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.status).not.toHaveBeenCalled();
	});
});
