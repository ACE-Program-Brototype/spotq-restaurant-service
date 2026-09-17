import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { IGetStaffDetailUseCase } from "@/application/ports/use-cases/get-staff-detail.use-case.port.ts";
import type { IUpdateStaffInfoUseCase } from "@/application/ports/use-cases/update-staff-info.use-case.port.ts";
import type { IUpdateStaffStatusUseCase } from "@/application/ports/use-cases/update-staff-status.use-case.port.ts";
import { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant-staff-management.controller.ts";
import type { AuthenticatedOwnerRequest } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantStaffManagementController", () => {
	let getStaffDetailUseCase: jest.Mocked<IGetStaffDetailUseCase>;
	let updateStaffInfoUseCase: jest.Mocked<IUpdateStaffInfoUseCase>;
	let updateStaffStatusUseCase: jest.Mocked<IUpdateStaffStatusUseCase>;
	let controller: RestaurantStaffManagementController;
	let res: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	const mockRestaurantId = "11111111-1111-1111-1111-111111111111";
	const mockStaffId = "22222222-2222-2222-2222-222222222222";

	beforeEach(() => {
		getStaffDetailUseCase = { execute: jest.fn() };
		updateStaffInfoUseCase = { execute: jest.fn() };
		updateStaffStatusUseCase = { execute: jest.fn() };

		controller = new RestaurantStaffManagementController(
			getStaffDetailUseCase,
			updateStaffInfoUseCase,
			updateStaffStatusUseCase,
		);

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		res = {
			status: statusMock as unknown as Response["status"],
			json: jsonMock as unknown as Response["json"],
		};
	});

	describe("getStaffDetail", () => {
		it("should return 200 OK with staff detail and success message", async () => {
			const mockStaffDetail = {
				id: "stf_02AB",
				restaurantId: "res_01ABC",
				fullname: "Ravi Kumar",
				email: "ravi@example.com",
				phone: "+919876543210",
				avatarUrl: null,
				role: "STAFF",
				status: "ACTIVE",
				createdAt: "2026-07-14T10:12:00.000Z",
				updatedAt: "2026-07-20T08:30:00.000Z",
			};

			const req = {
				user: {
					userId: "res_01ABC",
					restaurantId: "res_01ABC",
					email: "owner@spiceroute.com",
					role: "RESTAURANT_OWNER",
				},
				userId: "res_01ABC",
				params: {
					restaurantId: "res_01ABC",
					staffId: "stf_02AB",
				},
			};

			getStaffDetailUseCase.execute.mockResolvedValue(mockStaffDetail);

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res_01ABC",
				staffId: "stf_02AB",
			});
			expect(statusMock).toHaveBeenCalledWith(200);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: mockStaffDetail,
					message: messages.STAFF_DETAIL_FETCH_SUCCESS,
					statusCode: 200,
				}),
			);
		});

		it("should return 403 Forbidden when param restaurantId does not match authenticated owner restaurantId", async () => {
			const req = {
				user: {
					userId: "res_01ABC",
					restaurantId: "res_01ABC",
				},
				userId: "res_01ABC",
				params: {
					restaurantId: "res_OTHER",
					staffId: "stf_02AB",
				},
			};

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).not.toHaveBeenCalled();
			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: 403,
					code: "FORBIDDEN",
					message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				}),
			);
		});

		it("should return 403 Forbidden and not fall back to userId when owner restaurantId is missing or empty", async () => {
			const req = {
				user: {
					userId: "matching_id",
					restaurantId: "",
				},
				userId: "matching_id",
				params: {
					restaurantId: "matching_id",
					staffId: "stf_02AB",
				},
			};

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).not.toHaveBeenCalled();
			expect(statusMock).toHaveBeenCalledWith(403);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: 403,
					code: "FORBIDDEN",
					message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				}),
			);
		});

		it("should allow access when restaurantId matches authenticated user restaurantId", async () => {
			const mockStaffDetail = {
				id: "stf_02AB",
				restaurantId: "rest-uuid-456",
				fullname: "Ravi Kumar",
				email: "ravi@example.com",
				phone: "+919876543210",
				avatarUrl: null,
				role: "STAFF",
				status: "ACTIVE",
				createdAt: "2026-07-14T10:12:00.000Z",
				updatedAt: "2026-07-20T08:30:00.000Z",
			};

			const req = {
				user: {
					userId: "owner-user-123",
					restaurantId: "rest-uuid-456",
					email: "owner@spiceroute.com",
					role: "restaurant_owner",
				},
				params: {
					restaurantId: "rest-uuid-456",
					staffId: "stf_02AB",
				},
			};

			getStaffDetailUseCase.execute.mockResolvedValue(mockStaffDetail);

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "rest-uuid-456",
				staffId: "stf_02AB",
			});
			expect(statusMock).toHaveBeenCalledWith(200);
		});
	});

	describe("updateStaffInfo", () => {
		it("should update staff information and return 200 OK", async () => {
			const mockReq: Partial<AuthenticatedOwnerRequest> = {
				headers: { "x-user-id": "owner-123" },
				user: {
					userId: "owner-123",
					restaurantId: "res-123",
					email: "owner@restaurant.com",
					role: "RESTAURANT_OWNER",
				},
				params: {
					restaurantId: "res-123",
					staffId: "stf-456",
				},
				body: {
					fullname: "Ravi Kumar",
					phone: "+919876543210",
				},
			};

			const mockResponseData = {
				id: "stf-456",
				restaurant_id: "res-123",
				fullname: "Ravi Kumar",
				email: "ravi@example.com",
				phone: "+919876543210",
				avatar_url: null,
				role: "STAFF",
				status: "ACTIVE",
				created_at: "2026-09-01T10:00:00Z",
				updated_at: "2026-09-02T10:30:00Z",
			};

			updateStaffInfoUseCase.execute.mockResolvedValue(mockResponseData);

			await controller.updateStaffInfo(mockReq as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				message: messages.STAFF_UPDATED_SUCCESS,
				data: mockResponseData,
				statusCode: HTTP_STATUS.OK,
			});
			expect(updateStaffInfoUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res-123",
				staffId: "stf-456",
				fullname: "Ravi Kumar",
				phone: "+919876543210",
			});
		});

		it("should return 401 UNAUTHORIZED when user ID is missing", async () => {
			const mockReq: Partial<AuthenticatedOwnerRequest> = {
				headers: {},
				params: {
					restaurantId: "res-123",
					staffId: "stf-456",
				},
				body: { fullname: "Ravi Kumar" },
			};

			await controller.updateStaffInfo(mockReq as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.GATEWAY_UNAUTHORIZED,
					statusCode: HTTP_STATUS.UNAUTHORIZED,
				}),
			);
			expect(updateStaffInfoUseCase.execute).not.toHaveBeenCalled();
		});

		it("should return 403 FORBIDDEN when accessed restaurant does not match owner restaurantId", async () => {
			const mockReq: Partial<AuthenticatedOwnerRequest> = {
				headers: { "x-user-id": "owner-123" },
				user: {
					userId: "owner-123",
					restaurantId: "res-owned",
					email: "owner@restaurant.com",
					role: "RESTAURANT_OWNER",
				},
				params: {
					restaurantId: "res-other",
					staffId: "stf-456",
				},
				body: { fullname: "Ravi Kumar" },
			};

			await controller.updateStaffInfo(mockReq as Request, res as Response);

			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.RESTAURANT_ACCESS_FORBIDDEN,
					statusCode: HTTP_STATUS.FORBIDDEN,
				}),
			);
			expect(updateStaffInfoUseCase.execute).not.toHaveBeenCalled();
		});
	});

	describe("updateStaffStatus", () => {
		it("should return 401 if user is not authenticated", async () => {
			const req = {
				user: undefined,
				userId: undefined,
				headers: {},
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				body: { status: "INACTIVE" },
			};
			const next = jest.fn();

			await controller.updateStaffStatus(
				req as Request,
				res as Response,
				next as unknown as NextFunction,
			);

			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.GATEWAY_UNAUTHORIZED,
					statusCode: HTTP_STATUS.UNAUTHORIZED,
				}),
			);
		});

		it("should return 403 if param restaurantId does not match authenticated owner's restaurant", async () => {
			const req = {
				user: {
					userId: "owner-123",
					restaurantId: "other-restaurant-id",
					email: "owner@test.com",
					role: "RESTAURANT_OWNER",
				},
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				body: { status: "INACTIVE" },
			};
			const next = jest.fn();

			await controller.updateStaffStatus(
				req as Request,
				res as Response,
				next as unknown as NextFunction,
			);

			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.RESTAURANT_ACCESS_FORBIDDEN,
					statusCode: HTTP_STATUS.FORBIDDEN,
				}),
			);
		});

		it("should return 200 and updated staff status on success", async () => {
			const mockResult = {
				id: mockStaffId,
				restaurant_id: mockRestaurantId,
				fullname: "John Staff",
				email: "john@test.com",
				phone: "+919876543210",
				avatar_url: null,
				role: "STAFF",
				status: "INACTIVE",
				created_at: "2026-09-01T10:00:00.000Z",
			};

			updateStaffStatusUseCase.execute.mockResolvedValue(mockResult);

			const req = {
				user: {
					userId: "owner-123",
					restaurantId: mockRestaurantId,
					email: "owner@test.com",
					role: "RESTAURANT_OWNER",
				},
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				body: { status: "INACTIVE" },
			};
			const next = jest.fn();

			await controller.updateStaffStatus(
				req as Request,
				res as Response,
				next as unknown as NextFunction,
			);

			expect(updateStaffStatusUseCase.execute).toHaveBeenCalledWith({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
				status: "INACTIVE",
			});
			expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				message: messages.STAFF_STATUS_UPDATED_SUCCESS,
				data: mockResult,
				statusCode: HTTP_STATUS.OK,
			});
		});

		it("should pass unexpected errors to next", async () => {
			const error = new Error("Database failure");
			updateStaffStatusUseCase.execute.mockRejectedValue(error);

			const req = {
				user: {
					userId: "owner-123",
					restaurantId: mockRestaurantId,
					email: "owner@test.com",
					role: "RESTAURANT_OWNER",
				},
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				body: { status: "INACTIVE" },
			};
			const next = jest.fn();

			await controller.updateStaffStatus(
				req as Request,
				res as Response,
				next as unknown as NextFunction,
			);

			expect(next).toHaveBeenCalledWith(error);
		});
	});
});
