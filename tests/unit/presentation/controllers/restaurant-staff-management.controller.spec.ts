import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { IUpdateStaffStatusUseCase } from "@/application/ports/use-cases/update-staff-status.use-case.port.ts";
import { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant-staff-management.controller.ts";
import type { AuthenticatedOwnerRequest } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantStaffManagementController", () => {
	let updateStaffStatusUseCase: jest.Mocked<IUpdateStaffStatusUseCase>;
	let controller: RestaurantStaffManagementController;
	let req: Partial<AuthenticatedOwnerRequest>;
	let res: Partial<Response>;
	let next: jest.Mock;

	const mockRestaurantId = "11111111-1111-1111-1111-111111111111";
	const mockStaffId = "22222222-2222-2222-2222-222222222222";

	beforeEach(() => {
		updateStaffStatusUseCase = {
			execute: jest.fn(),
		};

		controller = new RestaurantStaffManagementController(
			updateStaffStatusUseCase,
		);

		req = {
			headers: {},
			params: {
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			},
			body: {
				status: "INACTIVE",
			},
			user: {
				userId: "owner-123",
				restaurantId: mockRestaurantId,
				email: "owner@test.com",
				role: "RESTAURANT_OWNER",
			},
		};

		res = {
			status: jest.fn().mockReturnThis() as unknown as Response["status"],
			json: jest.fn().mockReturnThis() as unknown as Response["json"],
		};

		next = jest.fn();
	});

	it("should return 401 if user is not authenticated", async () => {
		req.user = undefined;
		req.userId = undefined;
		req.headers = {};

		await controller.updateStaffStatus(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.GATEWAY_UNAUTHORIZED,
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 if param restaurantId does not match authenticated owner's restaurant", async () => {
		req.user = {
			userId: "owner-123",
			restaurantId: "other-restaurant-id",
			email: "owner@test.com",
			role: "RESTAURANT_OWNER",
		};

		await controller.updateStaffStatus(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(res.json).toHaveBeenCalledWith(
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
		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: messages.STAFF_STATUS_UPDATED_SUCCESS,
			data: mockResult,
			statusCode: HTTP_STATUS.OK,
		});
	});

	it("should pass unexpected errors to next", async () => {
		const error = new Error("Database failure");
		updateStaffStatusUseCase.execute.mockRejectedValue(error);

		await controller.updateStaffStatus(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(next).toHaveBeenCalledWith(error);
	});
});
