import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IGetCustomerRestaurantDetailsUseCase } from "@/application/ports/use-cases/restaurant/get-customer-restaurant-details.use-case.port.ts";
import type { ListCustomerRestaurantsUseCase } from "@/application/use-cases/restaurant/list-customer-restaurant.use-case.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

describe("CustomerRestaurantController", () => {
	let listCustomerRestaurantsUseCase: jest.Mocked<ListCustomerRestaurantsUseCase>;
	let getCustomerRestaurantDetailsUseCase: jest.Mocked<IGetCustomerRestaurantDetailsUseCase>;
	let controller: CustomerRestaurantController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		listCustomerRestaurantsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<ListCustomerRestaurantsUseCase>;

		getCustomerRestaurantDetailsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGetCustomerRestaurantDetailsUseCase>;

		controller = new CustomerRestaurantController(
			listCustomerRestaurantsUseCase,
			getCustomerRestaurantDetailsUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			locals: {},
		};
	});

	it("returns 200 with paginated exact data from backend including live coverImageKey or null", async () => {
		const mockResponse = {
			data: [
				{
					id: "res-uuid-1",
					restaurantName: "Biryani Express",
					city: "Calicut",
					state: "Kerala",
					cuisineType: "Mandi",
					averageCost: 400,
					coverImageKey: "restaurants/res-uuid-1/cover.jpg",
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
					coverImageKey: null,
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
			data: Array<{
				id: string;
				coverImageKey: string | null;
				coverImage?: string | null;
			}>;
		};
		expect(jsonCall.data[0].coverImageKey).toBe(
			"restaurants/res-uuid-1/cover.jpg",
		);
		expect(jsonCall.data[1].coverImageKey).toBeNull();
	});

	describe("getRestaurantDetails", () => {
		it("returns 200 with restaurant details response on success", async () => {
			const mockRestaurantDetails = {
				restaurantId: "res-uuid-1",
				restaurantName: "Biryani Express",
				phone: "+919876543210",
				email: "info@biryaniexpress.com",
				description: "Delicious Dum Biryani",
				cuisineType: "Mandi",
				averageCost: 400,
				coverImage: "restaurants/res-uuid-1/cover.jpg",
				address: {
					id: "addr-1",
					addressLine1: "123 Street",
					addressLine2: null,
					city: "Calicut",
					state: "Kerala",
					country: "India",
					pincode: "673001",
					latitude: 11.2588,
					longitude: 75.7804,
				},
				settings: {
					isOpened: true,
					isPreorder: false,
					acceptsQueue: true,
					acceptsQrOrders: true,
				},
				operatingHours: [],
				images: [],
				menu: [],
			};

			getCustomerRestaurantDetailsUseCase.execute.mockResolvedValueOnce(
				mockRestaurantDetails as never,
			);

			req = {
				headers: {},
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {
					includeMenu: "true",
				} as never,
			};

			res.locals = {
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {
					includeMenu: true,
				},
			};

			await controller.getRestaurantDetails(req as Request, res as Response);

			expect(getCustomerRestaurantDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res-uuid-1",
				includeMenu: true,
				categoryId: undefined,
				userId: undefined,
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: mockRestaurantDetails,
				}),
			);
		});

		it("passes verified userId from req.userId to use case", async () => {
			getCustomerRestaurantDetailsUseCase.execute.mockResolvedValueOnce(
				{} as never,
			);

			req = {
				userId: "usr-456",
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {} as never,
			};

			res.locals = {
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {
					includeMenu: true,
				},
			};

			await controller.getRestaurantDetails(req as Request, res as Response);

			expect(getCustomerRestaurantDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res-uuid-1",
				includeMenu: true,
				categoryId: undefined,
				userId: "usr-456",
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: {},
				}),
			);
		});

		it("does not trust raw x-user-id header when req.userId is undefined", async () => {
			getCustomerRestaurantDetailsUseCase.execute.mockResolvedValueOnce(
				{} as never,
			);

			req = {
				headers: {
					"x-user-id": "untrusted-spoofed-user",
				},
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {} as never,
			};

			res.locals = {
				params: {
					restaurantId: "res-uuid-1",
				},
				query: {
					includeMenu: true,
				},
			};

			await controller.getRestaurantDetails(req as Request, res as Response);

			expect(getCustomerRestaurantDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res-uuid-1",
				includeMenu: true,
				categoryId: undefined,
				userId: undefined,
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		});
	});
});
