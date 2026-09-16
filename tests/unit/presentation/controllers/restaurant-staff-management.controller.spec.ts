import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IUpdateStaffInfoUseCase } from "@/application/ports/use-cases/update-staff-info.use-case.port.ts";
import { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant-staff-management.controller.ts";
import type { AuthenticatedOwnerRequest } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("RestaurantStaffManagementController", () => {
	let updateStaffInfoUseCase: jest.Mocked<IUpdateStaffInfoUseCase>;
	let controller: RestaurantStaffManagementController;
	let mockReq: Partial<AuthenticatedOwnerRequest>;
	let mockRes: Partial<Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		updateStaffInfoUseCase = {
			execute: jest.fn(),
		};

		controller = new RestaurantStaffManagementController(
			updateStaffInfoUseCase,
		);

		jsonMock = jest.fn();
		statusMock = jest.fn().mockReturnValue({ json: jsonMock });

		mockRes = {
			status: statusMock as unknown as Response["status"],
			json: jsonMock as unknown as Response["json"],
		};
	});

	it("should update staff information and return 200 OK", async () => {
		mockReq = {
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

		await controller.updateStaffInfo(mockReq as Request, mockRes as Response);

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
		mockReq = {
			headers: {},
			params: {
				restaurantId: "res-123",
				staffId: "stf-456",
			},
			body: { fullname: "Ravi Kumar" },
		};

		await controller.updateStaffInfo(mockReq as Request, mockRes as Response);

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
		mockReq = {
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

		await controller.updateStaffInfo(mockReq as Request, mockRes as Response);

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
