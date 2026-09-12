import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";
import type { IGetStaffDetailUseCase } from "@/application/ports/use-cases/get-staff-detail.use-case.port.ts";
import { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant.staff.management.controller.ts";

describe("RestaurantStaffManagementController", () => {
	let getStaffDetailUseCase: jest.Mocked<IGetStaffDetailUseCase>;
	let controller: RestaurantStaffManagementController;
	let res: Partial<Response>;

	beforeEach(() => {
		getStaffDetailUseCase = { execute: jest.fn() };
		controller = new RestaurantStaffManagementController(getStaffDetailUseCase);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	describe("getStaffDetail", () => {
		it("should return 200 OK with staff detail and success message", async () => {
			const mockStaffDetail = {
				id: "stf_02AB",
				fullname: "Ravi Kumar",
				email: "ravi@example.com",
				phone: "+919876543210",
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
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: mockStaffDetail,
					message: "Staff member details retrieved successfully",
					statusCode: 200,
				}),
			);
		});

		it("should return 401 when authenticated user context is missing", async () => {
			const req = {
				headers: {},
				params: {
					restaurantId: "res_01ABC",
					staffId: "stf_02AB",
				},
			};

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "UNAUTHORIZED",
				}),
			);
		});

		it("should return 403 Forbidden when param restaurantId does not match authenticated user-id", async () => {
			const req = {
				user: {
					userId: "res_01ABC",
				},
				userId: "res_01ABC",
				params: {
					restaurantId: "res_OTHER",
					staffId: "stf_02AB",
				},
			};

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: 403,
					code: "FORBIDDEN",
					message: "Forbidden: Access to requested restaurant is denied",
				}),
			);
		});

		it("should handle array params correctly", async () => {
			const mockStaffDetail = {
				id: "stf_02AB",
				fullname: "Ravi Kumar",
				email: "ravi@example.com",
				phone: "+919876543210",
				role: "STAFF",
				status: "ACTIVE",
				createdAt: "2026-07-14T10:12:00.000Z",
				updatedAt: "2026-07-20T08:30:00.000Z",
			};

			const req = {
				user: {
					userId: "res_01ABC",
				},
				userId: "res_01ABC",
				params: {
					restaurantId: ["res_01ABC"],
					staffId: ["stf_02AB"],
				},
			};

			getStaffDetailUseCase.execute.mockResolvedValue(mockStaffDetail);

			await controller.getStaffDetail(req as never, res as Response);

			expect(getStaffDetailUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "res_01ABC",
				staffId: "stf_02AB",
			});
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

});
