import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ListCustomerRestaurantsUseCase } from "@/application/use-cases/restaurant/list-customer-restaurant.use-case.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

describe("CustomerRestaurantController", () => {
	let listCustomerRestaurantsUseCase: jest.Mocked<ListCustomerRestaurantsUseCase>;
	let controller: CustomerRestaurantController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		listCustomerRestaurantsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<ListCustomerRestaurantsUseCase>;

		controller = new CustomerRestaurantController(
			listCustomerRestaurantsUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			locals: {},
		};
	});

	it("returns 200 with paginated exact data from backend including live coverImage or null", async () => {
		const mockResponse = {
			data: [
				{
					id: "res-uuid-1",
					restaurantName: "Biryani Express",
					city: "Calicut",
					state: "Kerala",
					cuisineType: "Mandi",
					averageCost: 400,
					coverImage: "restaurants/res-uuid-1/cover.jpg",
					createdAt: new Date("2026-10-15T00:00:00.000Z"),
				},
				{
					id: "res-uuid-2",
					restaurantName: "Kerala Cafe",
					city: "Kochi",
					state: "Kerala",
					cuisineType: "South Indian",
					averageCost: 250,
					coverImage: null,
					createdAt: new Date("2026-10-15T00:00:00.000Z"),
				},
			],
			pagination: {
				page: 1,
				limit: 10,
				total: 2,
				totalPages: 1,
			},
		};

		listCustomerRestaurantsUseCase.execute.mockResolvedValueOnce(mockResponse);

		req = {
			query: {
				page: "1",
				limit: "10",
				cuisine: "Mandi",
			} as never,
		};

		await controller.listRestaurants(req as Request, res as Response);

		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				data: mockResponse.data,
				pagination: {
					page: 1,
					limit: 10,
					total: 2,
					totalPages: 1,
				},
			}),
		);
		// Verify exact data from backend is unmodified and not injected with mock photos
		const jsonCall = (res.json as jest.Mock).mock.calls[0][0] as {
			data: Array<{ id: string; coverImage: string | null }>;
		};
		expect(jsonCall.data[0].coverImage).toBe(
			"restaurants/res-uuid-1/cover.jpg",
		);
		expect(jsonCall.data[1].coverImage).toBeNull();
	});
});
