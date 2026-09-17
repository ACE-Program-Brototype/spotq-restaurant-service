import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AdminRestaurantController", () => {
	let getRestaurantDetailsUseCase: jest.Mocked<IGetRestaurantDetailsUseCase>;
	let listRestaurantsUseCase: jest.Mocked<IListRestaurantsUseCase>;
	let controller: AdminRestaurantController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: jest.MockedFunction<NextFunction>;

	const dummyDetails: RestaurantDetailsResponseDto = {
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		restaurantName: "Spice Route Bistro",
		category: "North Indian",
		email: "contact@spiceroute.com",
		phone: "+919876543210",
		ownerName: "Alice Smith",
		ownerEmail: "alice@spiceroute.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		isBlocked: false,
		blockReason: null,
		isSubscriptionActive: true,
		subscriptionPlanCode: "QUEUE_PRO",
		subscriptionEndsAt: new Date("2026-12-31T23:59:59.999Z"),
		lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		address: {
			id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			addressLine1: "123 Food Street",
			addressLine2: "Suite 4B",
			city: "Kochi",
			state: "Kerala",
			country: "India",
			pincode: "682001",
			latitude: 9.9312,
			longitude: 76.2673,
		},
		settings: {
			isOpened: true,
			isPreorder: false,
			isLoyaltyEnabled: true,
			cuisineType: "North Indian",
			seatingCapacity: 60,
			openTime: new Date("1970-01-01T09:00:00.000Z"),
			closeTime: new Date("1970-01-01T22:00:00.000Z"),
		},
		profile: {
			coverImage: "restaurants/cover.jpg",
			avatar: "restaurants/avatar.jpg",
			description: "Authentic North Indian Dining",
			fssaiNumber: "12345678901234",
			registerNumber: "REG-998877",
			gstNumber: "32ABCDE1234F1Z5",
		},
		operatingHours: [
			{
				id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
				dayOfWeek: 1,
				isOpen: true,
				openTime: new Date("1970-01-01T09:00:00.000Z"),
				closeTime: new Date("1970-01-01T22:00:00.000Z"),
			},
		],
		staff: [
			{
				id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
				fullname: "Bob Chef",
				email: "bob@spiceroute.com",
				phone: "+919876543211",
				role: "STAFF",
				status: "ACTIVE",
				avatarUrl: "staff/bob.jpg",
				createdAt: new Date("2026-01-05T00:00:00.000Z"),
			},
		],
		documents: [
			{
				id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
				documentType: "FSSAI",
				documentName: "fssai_cert.pdf",
				documentKey: "docs/fssai.pdf",
				verificationStatus: "VERIFIED",
				uploadedAt: new Date("2026-01-02T00:00:00.000Z"),
			},
		],
		images: [
			{
				id: "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
				objectKey: "images/interior.jpg",
				displayOrder: 1,
				createdAt: new Date("2026-01-03T00:00:00.000Z"),
			},
		],
		linkedAccount: {
			email: "alice@spiceroute.com",
			phone: "+919876543210",
			isEmailVerified: true,
			lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		getRestaurantDetailsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGetRestaurantDetailsUseCase>;

		listRestaurantsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IListRestaurantsUseCase>;

		controller = new AdminRestaurantController(
			getRestaurantDetailsUseCase,
			listRestaurantsUseCase,
		);

		req = {
			params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			query: {},
		};

		res = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	describe("getRestaurantDetails", () => {
		it("should return restaurant details when valid id provided", async () => {
			getRestaurantDetailsUseCase.execute.mockResolvedValue(dummyDetails);

			await controller.getRestaurantDetails(
				req as Request<{ id: string }>,
				res as Response,
				next,
			);

			expect(getRestaurantDetailsUseCase.execute).toHaveBeenCalledWith(
				"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: 200,
					message: "Restaurant details retrieved successfully",
					data: expect.objectContaining({
						id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
						restaurant_name: "Spice Route Bistro",
						owner_name: "Alice Smith",
						owner_email: "alice@spiceroute.com",
						onboarding_status: "COMPLETED",
						is_subscription_active: true,
					}),
				}),
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error when use case throws", async () => {
			const error = new Error("Use case error");
			getRestaurantDetailsUseCase.execute.mockRejectedValue(error);

			await controller.getRestaurantDetails(
				req as Request<{ id: string }>,
				res as Response,
				next,
			);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.status).not.toHaveBeenCalled();
		});
	});

	describe("listRestaurants", () => {
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

			listRestaurantsUseCase.execute.mockResolvedValueOnce(mockResponseData);

			res.locals = {
				query: {
					page: 1,
					limit: 10,
					search: "burger",
					sortBy: "createdAt",
					sortOrder: "desc",
				},
			};

			await controller.listRestaurants(req as Request, res as Response);

			expect(listRestaurantsUseCase.execute).toHaveBeenCalledWith(
				expect.objectContaining({
					page: 1,
					limit: 10,
					search: "burger",
					sortBy: "createdAt",
					sortOrder: "desc",
				}),
			);

			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: HTTP_STATUS.OK,
					message: messages.RESTAURANTS_FETCHED_SUCCESS,
					data: mockResponseData,
				}),
			);
		});
	});
});
