import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AdminRestaurantController", () => {
	let mockListRestaurantsUseCase: jest.Mocked<IListRestaurantsUseCase>;
	let controller: AdminRestaurantController;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockListRestaurantsUseCase = {
			execute: jest.fn(),
		};
		controller = new AdminRestaurantController(mockListRestaurantsUseCase);

		mockReq = {
			query: {},
		};

		mockRes = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	it("should execute use case and send success response with HTTP 200", async () => {
		const mockResponseData = {
			restaurants: [
				{
					id: "rest-1",
					restaurant: "Burger Point",
					restaurant_name: "Burger Point",
					owner: "Alice",
					owner_name: "Alice",
					contact: {
						email: "alice@burgerpoint.com",
						phone: "+919876543210",
						owner_email: "alice@burgerpoint.com",
					},
					plan: "PRO",
					subscription_plan_code: "PRO",
					status: "ACTIVE",
					is_subscription_active: true,
					onboarding_status: "COMPLETED",
					is_blocked: false,
					block_reason: null,
					created_at: "2026-01-01T00:00:00.000Z",
					updated_at: "2026-01-01T00:00:00.000Z",
					subscription_ends_at: null,
				},
			],
			pagination: {
				page: 1,
				limit: 10,
				total: 1,
				total_pages: 1,
				has_next_page: false,
				has_prev_page: false,
			},
		};

		mockListRestaurantsUseCase.execute.mockResolvedValueOnce(mockResponseData);

		mockRes.locals = {
			query: {
				page: 1,
				limit: 10,
				search: "burger",
				sortBy: "createdAt",
				sortOrder: "desc",
			},
		};

		await controller.listRestaurants(mockReq as Request, mockRes as Response);

		expect(mockListRestaurantsUseCase.execute).toHaveBeenCalledWith(
			expect.objectContaining({
				page: 1,
				limit: 10,
				search: "burger",
				sortBy: "createdAt",
				sortOrder: "desc",
			}),
		);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: HTTP_STATUS.OK,
				message: messages.RESTAURANTS_FETCHED_SUCCESS,
				data: mockResponseData,
			}),
		);
	});
});
