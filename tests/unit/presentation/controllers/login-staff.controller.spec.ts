import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import { LoginStaffController } from "@/presentation/controllers/staff/login-staff.controller.ts";

describe("LoginStaffController", () => {
	let loginStaffUseCase: jest.Mocked<ILoginStaffUseCase>;
	let controller: LoginStaffController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		loginStaffUseCase = {
			execute: jest.fn(),
		};

		controller = new LoginStaffController(loginStaffUseCase);

		req = {
			body: {
				email: "manager@spotq.com",
				password: "Password@123",
			},
		};

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			cookie: jest.fn().mockReturnThis() as never,
		};
	});

	it("should set HttpOnly refresh cookie and return 200 with accessToken", async () => {
		const mockResponse = {
			staff: {
				id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				fullname: "Sarah Manager",
				email: "manager@spotq.com",
				phone: "+1234567890",
				avatarUrl: null,
				role: "MANAGER",
				status: "ACTIVE",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			accessToken: "mock-access-token",
			refreshToken: "mock-refresh-token",
		};

		loginStaffUseCase.execute.mockResolvedValue(mockResponse);

		await controller.handle(req as Request, res as Response);

		expect(res.cookie).toHaveBeenCalledWith(
			"refreshToken",
			"mock-refresh-token",
			expect.objectContaining({
				httpOnly: true,
			}),
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 200,
				data: {
					staff: mockResponse.staff,
					accessToken: "mock-access-token",
				},
			}),
		);
	});

	it("should propagate errors when use case fails", async () => {
		const mockError = new Error("Invalid credentials");
		loginStaffUseCase.execute.mockRejectedValue(mockError);

		await expect(
			controller.handle(req as Request, res as Response),
		).rejects.toThrow("Invalid credentials");
	});
});
