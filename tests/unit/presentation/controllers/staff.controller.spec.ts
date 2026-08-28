import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import { StaffController } from "@/presentation/controllers/staff.controller.ts";

describe("StaffController", () => {
	let loginStaffUseCase: jest.Mocked<ILoginStaffUseCase>;
	let logoutStaffUseCase: jest.Mocked<ILogoutStaffUseCase>;
	let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>;
	let controller: StaffController;
	let res: Partial<Response>;

	beforeEach(() => {
		loginStaffUseCase = {
			execute: jest.fn(),
		};

		logoutStaffUseCase = {
			execute: jest.fn(),
		};

		refreshTokenUseCase = {
			execute: jest.fn(),
		};

		controller = new StaffController(
			loginStaffUseCase,
			logoutStaffUseCase,
			refreshTokenUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			cookie: jest.fn().mockReturnThis() as never,
			clearCookie: jest.fn().mockReturnThis() as never,
		};
	});

	describe("login", () => {
		it("should authenticate staff and set HttpOnly refresh cookie", async () => {
			const req: Partial<Request> = {
				body: {
					email: "manager@spotq.com",
					password: "Password@123",
				},
			};

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

			await controller.login(req as Request, res as Response);

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

		it("should propagate errors when login fails", async () => {
			const req: Partial<Request> = {
				body: { email: "manager@spotq.com", password: "wrong" },
			};
			const mockError = new Error("Invalid credentials");
			loginStaffUseCase.execute.mockRejectedValue(mockError);

			await expect(
				controller.login(req as Request, res as Response),
			).rejects.toThrow("Invalid credentials");
		});
	});

	describe("logout", () => {
		it("should extract refreshToken from cookie, call logout use case, and clear cookie", async () => {
			const req: Partial<Request> = {
				cookies: {
					refreshToken: "mock-refresh-token",
				},
			};

			logoutStaffUseCase.execute.mockResolvedValue(undefined);

			await controller.logout(req as Request, res as Response);

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
	});

	describe("refreshToken", () => {
		it("should extract refresh token from cookie and return 200 with new accessToken", async () => {
			const req: Partial<Request> = {
				cookies: {
					refreshToken: "mock-refresh-token",
				},
			};

			refreshTokenUseCase.execute.mockResolvedValue({
				accessToken: "new-access-token",
			});

			await controller.refreshToken(req as Request, res as Response);

			expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
				refreshToken: "mock-refresh-token",
			});

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					statusCode: 200,
					data: {
						accessToken: "new-access-token",
					},
					message: "Access token refreshed successfully",
				}),
			);
		});

		it("should extract refresh token from request body if cookie is missing", async () => {
			const req: Partial<Request> = {
				cookies: {},
				body: {
					refreshToken: "body-refresh-token",
				},
			};

			refreshTokenUseCase.execute.mockResolvedValue({
				accessToken: "new-access-token",
			});

			await controller.refreshToken(req as Request, res as Response);

			expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
				refreshToken: "body-refresh-token",
			});
		});

		it("should propagate errors when refresh token is invalid", async () => {
			const req: Partial<Request> = {
				cookies: {},
			};

			const mockError = new Error("Invalid or expired refresh token");
			refreshTokenUseCase.execute.mockRejectedValue(mockError);

			await expect(
				controller.refreshToken(req as Request, res as Response),
			).rejects.toThrow("Invalid or expired refresh token");
		});
	});
});
