import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { StaffController } from "@/presentation/controllers/staff.controller.ts";

describe("StaffController", () => {
	let loginStaffUseCase: jest.Mocked<ILoginStaffUseCase>;
	let logoutStaffUseCase: jest.Mocked<ILogoutStaffUseCase>;
	let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>;
	let forgotPasswordUseCase: jest.Mocked<IForgotPasswordUseCase>;
	let verifyForgotPasswordOtpUseCase: jest.Mocked<IVerifyForgotPasswordOtpUseCase>;
	let resendForgotPasswordOtpUseCase: jest.Mocked<IResendForgotPasswordOtpUseCase>;
	let resetPasswordUseCase: jest.Mocked<IResetPasswordUseCase>;
	let controller: StaffController;
	let res: Partial<Response>;

	beforeEach(() => {
		loginStaffUseCase = { execute: jest.fn() };
		logoutStaffUseCase = { execute: jest.fn() };
		refreshTokenUseCase = { execute: jest.fn() };
		forgotPasswordUseCase = { execute: jest.fn() };
		verifyForgotPasswordOtpUseCase = { execute: jest.fn() };
		resendForgotPasswordOtpUseCase = { execute: jest.fn() };
		resetPasswordUseCase = { execute: jest.fn() };

		controller = new StaffController(
			loginStaffUseCase,
			logoutStaffUseCase,
			refreshTokenUseCase,
			forgotPasswordUseCase,
			verifyForgotPasswordOtpUseCase,
			resendForgotPasswordOtpUseCase,
			resetPasswordUseCase,
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
					role: "STAFF",
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
		});
	});

	describe("refreshToken", () => {
		it("should return new access token", async () => {
			const req: Partial<Request> = {
				cookies: {
					refreshToken: "mock-refresh-token",
				},
			};

			refreshTokenUseCase.execute.mockResolvedValue({
				accessToken: "new-access-token",
			});

			await controller.refreshToken(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: { accessToken: "new-access-token" },
				}),
			);
		});
	});

	describe("forgotPassword", () => {
		it("should execute forgot password and return 200", async () => {
			const req: Partial<Request> = {
				body: { email: "manager@spotq.com" },
			};

			forgotPasswordUseCase.execute.mockResolvedValue();

			await controller.forgotPassword(req as Request, res as Response);

			expect(forgotPasswordUseCase.execute).toHaveBeenCalledWith({
				email: "manager@spotq.com",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: "OTP sent to your email successfully",
				}),
			);
		});
	});

	describe("verifyForgotPasswordOtp", () => {
		it("should verify OTP, set tempToken in cookie, and return 200", async () => {
			const req: Partial<Request> = {
				body: { email: "manager@spotq.com", otp: "123456" },
			};

			verifyForgotPasswordOtpUseCase.execute.mockResolvedValue({
				tempToken: "mock-temp-token",
			});

			await controller.verifyForgotPasswordOtp(req as Request, res as Response);

			expect(verifyForgotPasswordOtpUseCase.execute).toHaveBeenCalledWith({
				email: "manager@spotq.com",
				otp: "123456",
			});
			expect(res.cookie).toHaveBeenCalledWith(
				"tempToken",
				"mock-temp-token",
				expect.objectContaining({
					httpOnly: true,
					maxAge: 15 * 60 * 1000,
				}),
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("resendForgotPasswordOtp", () => {
		it("should resend OTP and return 200", async () => {
			const req: Partial<Request> = {
				body: { email: "manager@spotq.com" },
			};

			resendForgotPasswordOtpUseCase.execute.mockResolvedValue();

			await controller.resendForgotPasswordOtp(req as Request, res as Response);

			expect(resendForgotPasswordOtpUseCase.execute).toHaveBeenCalledWith({
				email: "manager@spotq.com",
			});
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("resetPassword", () => {
		it("should reset password, clear tempToken cookie, and return 200", async () => {
			const req: Partial<Request> = {
				body: { password: "NewPassword@123" },
				cookies: { tempToken: "mock-temp-token" },
			};

			resetPasswordUseCase.execute.mockResolvedValue();

			await controller.resetPassword(req as Request, res as Response);

			expect(resetPasswordUseCase.execute).toHaveBeenCalledWith({
				password: "NewPassword@123",
				tempToken: "mock-temp-token",
			});
			expect(res.clearCookie).toHaveBeenCalledWith(
				"tempToken",
				expect.objectContaining({
					httpOnly: true,
				}),
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: "Password reset successfully",
				}),
			);
		});
	});
});
