import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import type { AuthenticatedAdminRequest } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AdminRestaurantController", () => {
	let approveRestaurantUseCase: jest.Mocked<IApproveRestaurantUseCase>;
	let rejectRestaurantUseCase: jest.Mocked<IRejectRestaurantUseCase>;
	let listRestaurantApplicationsUseCase: jest.Mocked<IListRestaurantApplicationsUseCase>;
	let getRestaurantApplicationDetailsUseCase: jest.Mocked<IGetRestaurantApplicationDetailsUseCase>;
	let getRestaurantDetailsUseCase: jest.Mocked<IGetRestaurantDetailsUseCase>;
	let listRestaurantsUseCase: jest.Mocked<IListRestaurantsUseCase>;
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
		jest.clearAllMocks();
		approveRestaurantUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IApproveRestaurantUseCase>;
		rejectRestaurantUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IRejectRestaurantUseCase>;
		listRestaurantApplicationsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IListRestaurantApplicationsUseCase>;
		getRestaurantApplicationDetailsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGetRestaurantApplicationDetailsUseCase>;
		getRestaurantDetailsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IGetRestaurantDetailsUseCase>;
		listRestaurantsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IListRestaurantsUseCase>;
		blockRestaurantUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IBlockRestaurantUseCase>;
		unblockRestaurantUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<IUnblockRestaurantUseCase>;

		controller = new AdminRestaurantController(
			approveRestaurantUseCase,
			rejectRestaurantUseCase,
			listRestaurantApplicationsUseCase,
			getRestaurantApplicationDetailsUseCase,
			getRestaurantDetailsUseCase,
			listRestaurantsUseCase,
			blockRestaurantUseCase,
			unblockRestaurantUseCase,
		);

		req = {
			params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			query: {},
			user: {
				userId: "admin-123",
				email: "admin@spotq.com",
				role: "ADMIN",
			},
		};

		res = {
			locals: {},
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};

		next = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	describe("listRestaurantApplications", () => {
		it("should invoke ListRestaurantApplicationsUseCase and return 200 OK with list and pagination", async () => {
			req.query = { page: "1", limit: "10", status: "PENDING" };

			const mockResult = {
				restaurants: [
					{
						id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
						restaurantName: "Gourmet Bistro",
						email: "bistro@example.com",
						phone: "+1234567890",
						ownerName: "Alice Smith",
						ownerEmail: "alice@example.com",
						status: "PENDING",
						onboardingStatus: "COMPLETED",
						emailVerifiedAt: new Date(),
						rejectionReason: null,
						createdAt: new Date(),
						updatedAt: new Date(),
						address: null,
						documents: [],
						images: [],
					},
				],
				pagination: {
					page: 1,
					limit: 10,
					total: 1,
					totalPages: 1,
					hasNextPage: false,
					hasPrevPage: false,
				},
			};

			listRestaurantApplicationsUseCase.execute.mockResolvedValue(mockResult);

			await controller.listRestaurantApplications(
				req as Request,
				res as Response,
			);

			expect(listRestaurantApplicationsUseCase.execute).toHaveBeenCalledWith(
				req.query,
			);
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.RESTAURANT_APPLICATIONS_FETCHED_SUCCESS,
					data: {
						restaurants: [
							expect.objectContaining({
								id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
								restaurant_name: "Gourmet Bistro",
								owner_name: "Alice Smith",
								owner_email: "alice@example.com",
								status: "PENDING",
								onboarding_status: "COMPLETED",
							}),
						],
						pagination: mockResult.pagination,
					},
				}),
			);
		});
	});

	describe("getRestaurantApplicationDetails", () => {
		it("should invoke GetRestaurantApplicationDetailsUseCase and return 200 OK with detailed data", async () => {
			req.params = { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" };

			const mockResult = {
				id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				restaurantName: "Gourmet Bistro",
				email: "bistro@example.com",
				phone: "+1234567890",
				ownerName: "Alice Smith",
				ownerEmail: "alice@example.com",
				status: "PENDING",
				onboardingStatus: "COMPLETED",
				emailVerifiedAt: new Date(),
				rejectionReason: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				address: null,
				documents: [],
				images: [],
			};

			getRestaurantApplicationDetailsUseCase.execute.mockResolvedValue(
				mockResult,
			);

			await controller.getRestaurantApplicationDetails(
				req as Request,
				res as Response,
			);

			expect(
				getRestaurantApplicationDetailsUseCase.execute,
			).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message:
						messages.RESTAURANT_APPLICATION_DETAILS_FETCHED_SUCCESS,
					data: expect.objectContaining({
						id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
						restaurant_name: "Gourmet Bistro",
						owner_name: "Alice Smith",
						owner_email: "alice@example.com",
					}),
				}),
			);
		});
	});

	describe("approveRestaurant", () => {
		it("should invoke ApproveRestaurantUseCase and return 200 OK with success response", async () => {
			req.params = { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" };
			req.user = {
				userId: "admin-uuid-1",
				email: "admin@spotq.com",
				role: "ADMIN",
			};

			const mockResult = {
				id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				restaurantName: "Gourmet Bistro",
				status: "APPROVED",
				reviewedBy: "admin-uuid-1",
				reviewedAt: new Date(),
			};

			approveRestaurantUseCase.execute.mockResolvedValue(mockResult);

			await controller.approveRestaurant(req as Request, res as Response);

			expect(approveRestaurantUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				adminId: "admin-uuid-1",
			});

			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.RESTAURANT_APPROVED_SUCCESS,
					data: {
						id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
						restaurant_name: "Gourmet Bistro",
						status: "APPROVED",
						reviewed_by: "admin-uuid-1",
						reviewed_at: mockResult.reviewedAt,
					},
					statusCode: HTTP_STATUS.OK,
				}),
			);
		});
	});

	describe("rejectRestaurant", () => {
		it("should invoke RejectRestaurantUseCase and return 200 OK with success response", async () => {
			req.params = { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" };
			req.body = { reason: "Incomplete GST details" };
			req.user = {
				userId: "admin-uuid-2",
				email: "admin@spotq.com",
				role: "ADMIN",
			};

			const mockResult = {
				id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				restaurantName: "Gourmet Bistro",
				status: "REJECTED",
				rejectionReason: "Incomplete GST details",
				reviewedBy: "admin-uuid-2",
				reviewedAt: new Date(),
			};

			rejectRestaurantUseCase.execute.mockResolvedValue(mockResult);

			await controller.rejectRestaurant(req as Request, res as Response);

			expect(rejectRestaurantUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				reason: "Incomplete GST details",
				adminId: "admin-uuid-2",
			});

			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.RESTAURANT_REJECTED_SUCCESS,
					data: {
						id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
						restaurant_name: "Gourmet Bistro",
						status: "REJECTED",
						rejection_reason: "Incomplete GST details",
						reviewed_by: "admin-uuid-2",
						reviewed_at: mockResult.reviewedAt,
					},
					statusCode: HTTP_STATUS.OK,
				}),
			);
		});
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

			listRestaurantsUseCase.execute.mockResolvedValueOnce(mockResponseData as never);

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
