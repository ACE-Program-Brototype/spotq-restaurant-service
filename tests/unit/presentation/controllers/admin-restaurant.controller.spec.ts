import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import type { AuthenticatedAdminRequest } from "@/presentation/http/middleware/admin.auth.middleware.ts";

describe("AdminRestaurantController", () => {
	let getRestaurantDetailsUseCase: jest.Mocked<IGetRestaurantDetailsUseCase>;
	let blockRestaurantUseCase: jest.Mocked<IBlockRestaurantUseCase>;
	let unblockRestaurantUseCase: jest.Mocked<IUnblockRestaurantUseCase>;
	let controller: AdminRestaurantController;
	let req: Partial<AuthenticatedAdminRequest>;
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
		getRestaurantDetailsUseCase = {
			execute: jest.fn(),
		};
		blockRestaurantUseCase = {
			execute: jest.fn(),
		};
		unblockRestaurantUseCase = {
			execute: jest.fn(),
		};
		controller = new AdminRestaurantController(
			getRestaurantDetailsUseCase,
			blockRestaurantUseCase,
			unblockRestaurantUseCase,
		);

		req = {
			params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			user: {
				userId: "admin-123",
				email: "admin@spotq.com",
				role: "ADMIN",
			},
		};

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	describe("getRestaurantDetails", () => {
		it("should return 200 with snake_case mapped restaurant details when found", async () => {
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

	describe("blockRestaurant", () => {
		it("should return 200 with snake_case response when restaurant is blocked successfully", async () => {
			const blockResult = {
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				restaurantName: "Spice Route Bistro",
				status: "SUSPENDED",
				isBlocked: true,
				blockReason: "Violation of terms",
				updatedAt: new Date("2026-03-01T12:00:00.000Z"),
			};
			blockRestaurantUseCase.execute.mockResolvedValue(blockResult);

			req.body = { reason: "Violation of terms" };

			await controller.blockRestaurant(
				req as Request<{ id: string }, unknown, { reason: string }>,
				res as Response,
				next,
			);

			expect(blockRestaurantUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				reason: "Violation of terms",
				adminId: "admin-123",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: 200,
					message: "Restaurant blocked successfully.",
					data: {
						id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
						restaurant_name: "Spice Route Bistro",
						status: "SUSPENDED",
						is_blocked: true,
						block_reason: "Violation of terms",
						updated_at: expect.any(Date),
					},
				}),
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error when blockRestaurantUseCase throws", async () => {
			const error = new Error("Block error");
			blockRestaurantUseCase.execute.mockRejectedValue(error);
			req.body = { reason: "Violation of terms" };

			await controller.blockRestaurant(
				req as Request<{ id: string }, unknown, { reason: string }>,
				res as Response,
				next,
			);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.status).not.toHaveBeenCalled();
		});
	});

	describe("unblockRestaurant", () => {
		it("should return 200 with snake_case response when restaurant is unblocked successfully", async () => {
			const unblockResult = {
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				restaurantName: "Spice Route Bistro",
				status: "ACTIVE",
				isBlocked: false,
				blockReason: null,
				updatedAt: new Date("2026-03-01T12:00:00.000Z"),
			};
			unblockRestaurantUseCase.execute.mockResolvedValue(unblockResult);

			await controller.unblockRestaurant(
				req as Request<{ id: string }>,
				res as Response,
				next,
			);

			expect(unblockRestaurantUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				adminId: "admin-123",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: 200,
					message: "Restaurant unblocked successfully.",
					data: {
						id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
						restaurant_name: "Spice Route Bistro",
						status: "ACTIVE",
						is_blocked: false,
						block_reason: null,
						updated_at: expect.any(Date),
					},
				}),
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error when unblockRestaurantUseCase throws", async () => {
			const error = new Error("Unblock error");
			unblockRestaurantUseCase.execute.mockRejectedValue(error);

			await controller.unblockRestaurant(
				req as Request<{ id: string }>,
				res as Response,
				next,
			);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.status).not.toHaveBeenCalled();
		});
	});
});
