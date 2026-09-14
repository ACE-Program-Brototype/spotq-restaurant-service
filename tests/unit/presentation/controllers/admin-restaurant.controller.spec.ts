import type { Response } from "express";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import type { AuthenticatedAdminRequest } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("AdminRestaurantController", () => {
	let controller: AdminRestaurantController;
	let mockApproveUseCase: jest.Mocked<IApproveRestaurantUseCase>;
	let mockRejectUseCase: jest.Mocked<IRejectRestaurantUseCase>;
	let mockListUseCase: jest.Mocked<IListRestaurantApplicationsUseCase>;
	let mockGetDetailsUseCase: jest.Mocked<IGetRestaurantApplicationDetailsUseCase>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockApproveUseCase = {
			execute: jest.fn(),
		};
		mockRejectUseCase = {
			execute: jest.fn(),
		};
		mockListUseCase = {
			execute: jest.fn(),
		};
		mockGetDetailsUseCase = {
			execute: jest.fn(),
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			locals: {},
		};

		controller = new AdminRestaurantController(
			mockApproveUseCase,
			mockRejectUseCase,
			mockListUseCase,
			mockGetDetailsUseCase,
		);
	});

	describe("listRestaurantApplications", () => {
		it("should invoke ListRestaurantApplicationsUseCase and return 200 OK with list and pagination", async () => {
			const req = {
				query: { page: "1", limit: "10", status: "PENDING" },
			} as unknown as AuthenticatedAdminRequest;

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

			mockListUseCase.execute.mockResolvedValue(mockResult);

			await controller.listRestaurantApplications(
				req,
				mockResponse as Response,
			);

			expect(mockListUseCase.execute).toHaveBeenCalledWith(req.query);
			expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockResponse.json).toHaveBeenCalledWith(
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
			const req = {
				params: { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
			} as unknown as AuthenticatedAdminRequest;

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

			mockGetDetailsUseCase.execute.mockResolvedValue(mockResult);

			await controller.getRestaurantApplicationDetails(
				req,
				mockResponse as Response,
			);

			expect(mockGetDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
			});
			expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockResponse.json).toHaveBeenCalledWith(
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
			const req = {
				params: { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
				user: {
					userId: "admin-uuid-1",
					email: "admin@spotq.com",
					role: "ADMIN",
				},
			} as unknown as AuthenticatedAdminRequest;

			const mockResult = {
				id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				restaurantName: "Gourmet Bistro",
				status: "APPROVED",
				reviewedBy: "admin-uuid-1",
				reviewedAt: new Date(),
			};

			mockApproveUseCase.execute.mockResolvedValue(mockResult);

			await controller.approveRestaurant(req, mockResponse as Response);

			expect(mockApproveUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				adminId: "admin-uuid-1",
			});

			expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockResponse.json).toHaveBeenCalledWith(
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
			const req = {
				params: { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
				body: { reason: "Incomplete GST details" },
				user: {
					userId: "admin-uuid-2",
					email: "admin@spotq.com",
					role: "ADMIN",
				},
			} as unknown as AuthenticatedAdminRequest;

			const mockResult = {
				id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				restaurantName: "Gourmet Bistro",
				status: "REJECTED",
				rejectionReason: "Incomplete GST details",
				reviewedBy: "admin-uuid-2",
				reviewedAt: new Date(),
			};

			mockRejectUseCase.execute.mockResolvedValue(mockResult);

			await controller.rejectRestaurant(req, mockResponse as Response);

			expect(mockRejectUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
				reason: "Incomplete GST details",
				adminId: "admin-uuid-2",
			});

			expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockResponse.json).toHaveBeenCalledWith(
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
});
