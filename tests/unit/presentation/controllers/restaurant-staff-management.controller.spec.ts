import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IRemoveStaffUseCase } from "@/application/ports/use-cases/remove-staff.use-case.port.ts";
import { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant-staff-management.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantStaffManagementController", () => {
	let removeStaffUseCase: jest.Mocked<IRemoveStaffUseCase>;
	let controller: RestaurantStaffManagementController;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	const mockRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const mockStaffId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";

	beforeEach(() => {
		removeStaffUseCase = {
			execute: jest.fn(),
		};

		controller = new RestaurantStaffManagementController(removeStaffUseCase);

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	describe("removeStaff", () => {
		it("should remove staff member and return 200 with null data", async () => {
			mockReq = {
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				headers: {},
				user: {
					userId: "owner-user-id",
					restaurantId: mockRestaurantId,
					email: "owner@spiceroute.com",
					role: "restaurant_owner",
				},
			};

			await controller.removeStaff(mockReq as Request, mockRes as Response);

			expect(removeStaffUseCase.execute).toHaveBeenCalledWith({
				restaurantId: mockRestaurantId,
				staffId: mockStaffId,
			});
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.STAFF_REMOVED_SUCCESS,
					data: null,
					statusCode: HTTP_STATUS.OK,
				}),
			);
		});

		it("should return 401 when no authenticated restaurant or user ID is found", async () => {
			mockReq = {
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				headers: {},
				user: undefined,
			};

			await controller.removeStaff(mockReq as Request, mockRes as Response);

			expect(removeStaffUseCase.execute).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.GATEWAY_UNAUTHORIZED,
					statusCode: HTTP_STATUS.UNAUTHORIZED,
				}),
			);
		});

		it("should return 403 when authenticated restaurantId does not match param restaurantId", async () => {
			mockReq = {
				params: {
					restaurantId: mockRestaurantId,
					staffId: mockStaffId,
				},
				headers: {},
				user: {
					userId: "owner-user-id",
					restaurantId: "different-restaurant-id",
					email: "owner@spiceroute.com",
					role: "restaurant_owner",
				},
			};

			await controller.removeStaff(mockReq as Request, mockRes as Response);

			expect(removeStaffUseCase.execute).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: messages.RESTAURANT_ACCESS_FORBIDDEN,
					statusCode: HTTP_STATUS.FORBIDDEN,
				}),
			);
		});
	});
});
