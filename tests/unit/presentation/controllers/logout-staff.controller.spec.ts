import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import { LogoutStaffController } from "@/presentation/controllers/staff/logout-staff.controller.ts";

describe("LogoutStaffController", () => {
	let logoutStaffUseCase: jest.Mocked<ILogoutStaffUseCase>;
	let controller: LogoutStaffController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		logoutStaffUseCase = {
			execute: jest.fn(),
		};

		controller = new LogoutStaffController(logoutStaffUseCase);

		req = {
			cookies: {
				refreshToken: "mock-refresh-token",
			},
		};

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			clearCookie: jest.fn().mockReturnThis() as never,
		};
	});

	it("should clear the refresh token cookie and return 200 OK", async () => {
		logoutStaffUseCase.execute.mockResolvedValue(undefined);

		await controller.handle(req as Request, res as Response);

		expect(logoutStaffUseCase.execute).toHaveBeenCalledWith({
			refreshToken: "mock-refresh-token",
		});

		expect(res.clearCookie).toHaveBeenCalledWith(
			"refreshToken",
			expect.objectContaining({
				httpOnly: true,
				path: "/",
			}),
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 200,
				message: "Staff logged out successfully",
			}),
		);
	});

	it("should propagate errors when use case execution fails", async () => {
		const mockError = new Error("Logout execution failed");
		logoutStaffUseCase.execute.mockRejectedValue(mockError);

		await expect(
			controller.handle(req as Request, res as Response),
		).rejects.toThrow("Logout execution failed");
	});
});
