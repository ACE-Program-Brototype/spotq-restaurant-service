import { RestaurantIdRequiredError } from "@domain/errors/staff.errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IAcceptInvitationUseCase } from "@/application/ports/use-cases/accept-invitation.use-case.port.ts";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port.ts";
import type { IGetStaffProfileUseCase } from "@/application/ports/use-cases/get-staff-profile.use-case.port.ts";
import type { IInviteStaffUseCase } from "@/application/ports/use-cases/invite-staff.use-case.port.ts";
import type { IListStaffInvitationsUseCase } from "@/application/ports/use-cases/list-staff-invitations.use-case.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import type { IResendStaffInvitationUseCase } from "@/application/ports/use-cases/resend-invitation.use-case.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import type { IRevokeStaffInvitationUseCase } from "@/application/ports/use-cases/revoke-invitation.use-case.port.ts";
import type { IValidateInvitationUseCase } from "@/application/ports/use-cases/validate-invitation.use-case.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { StaffController } from "@/presentation/http/controllers/staff.controller.ts";

describe("StaffController", () => {
	let loginStaffUseCase: jest.Mocked<ILoginStaffUseCase>;
	let logoutStaffUseCase: jest.Mocked<ILogoutStaffUseCase>;
	let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>;
	let forgotPasswordUseCase: jest.Mocked<IForgotPasswordUseCase>;
	let verifyForgotPasswordOtpUseCase: jest.Mocked<IVerifyForgotPasswordOtpUseCase>;
	let resendForgotPasswordOtpUseCase: jest.Mocked<IResendForgotPasswordOtpUseCase>;
	let resetPasswordUseCase: jest.Mocked<IResetPasswordUseCase>;
	let inviteStaffUseCase: jest.Mocked<IInviteStaffUseCase>;
	let validateInvitationUseCase: jest.Mocked<IValidateInvitationUseCase>;
	let acceptInvitationUseCase: jest.Mocked<IAcceptInvitationUseCase>;
	let resendStaffInvitationUseCase: jest.Mocked<IResendStaffInvitationUseCase>;
	let revokeStaffInvitationUseCase: jest.Mocked<IRevokeStaffInvitationUseCase>;
	let listStaffInvitationsUseCase: jest.Mocked<IListStaffInvitationsUseCase>;
	let getStaffProfileUseCase: jest.Mocked<IGetStaffProfileUseCase>;
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
		inviteStaffUseCase = { execute: jest.fn() };
		validateInvitationUseCase = { execute: jest.fn() };
		acceptInvitationUseCase = { execute: jest.fn() };
		resendStaffInvitationUseCase = { execute: jest.fn() };
		revokeStaffInvitationUseCase = { execute: jest.fn() };
		listStaffInvitationsUseCase = { execute: jest.fn() };
		getStaffProfileUseCase = { execute: jest.fn() };

		controller = new StaffController(
			loginStaffUseCase,
			logoutStaffUseCase,
			refreshTokenUseCase,
			forgotPasswordUseCase,
			verifyForgotPasswordOtpUseCase,
			resendForgotPasswordOtpUseCase,
			resetPasswordUseCase,
			inviteStaffUseCase,
			validateInvitationUseCase,
			acceptInvitationUseCase,
			resendStaffInvitationUseCase,
			revokeStaffInvitationUseCase,
			listStaffInvitationsUseCase,
			getStaffProfileUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			cookie: jest.fn().mockReturnThis() as never,
			clearCookie: jest.fn().mockReturnThis() as never,
			locals: {},
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

	describe("inviteStaff", () => {
		it("should invite staff using x-restaurant-id header and return 201", async () => {
			const req: Partial<Request> = {
				body: { email: "invited@spotq.com" },
				headers: { "x-restaurant-id": "rest-uuid-123" },
			};

			const mockInvitationResult = {
				id: "inv-uuid-123",
				email: "invited@spotq.com",
				restaurantId: "rest-uuid-123",
				status: "PENDING",
				expiresAt: new Date(),
				createdAt: new Date(),
			};

			inviteStaffUseCase.execute.mockResolvedValue(mockInvitationResult);

			await controller.inviteStaff(req as Request, res as Response);

			expect(inviteStaffUseCase.execute).toHaveBeenCalledWith({
				email: "invited@spotq.com",
				restaurantId: "rest-uuid-123",
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: "Staff invitation sent successfully",
					data: mockInvitationResult,
				}),
			);
		});

		it("should throw RestaurantIdRequiredError when x-restaurant-id is missing even if x-user-id is present", async () => {
			const req: Partial<Request> = {
				body: { email: "invited@spotq.com" },
				headers: { "x-user-id": "user-uuid-123" },
			};

			await expect(
				controller.inviteStaff(req as Request, res as Response),
			).rejects.toThrow(RestaurantIdRequiredError);
		});

		it("should throw RestaurantIdRequiredError when no restaurant header is provided", async () => {
			const req: Partial<Request> = {
				body: { email: "invited@spotq.com" },
				headers: {},
			};

			await expect(
				controller.inviteStaff(req as Request, res as Response),
			).rejects.toThrow();
		});
	});

	describe("validateInvitation", () => {
		it("should validate invitation token and return 200", async () => {
			const req: Partial<Request> = {
				body: { token: "raw-token-123" },
			};

			const mockResult = {
				valid: true,
				email: "staff@example.com",
				restaurantName: "Tasty Bites",
			};

			validateInvitationUseCase.execute.mockResolvedValue(mockResult);

			await controller.validateInvitation(req as Request, res as Response);

			expect(validateInvitationUseCase.execute).toHaveBeenCalledWith({
				token: "raw-token-123",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: mockResult,
				}),
			);
		});
	});

	describe("acceptInvitation", () => {
		it("should accept invitation, set refresh token cookie, and return 201 with access token", async () => {
			const req: Partial<Request> = {
				body: {
					token: "raw-token-123",
					fullname: "John Doe",
					phone: "+919876543210",
					password: "SecurePassword1!",
				},
			};

			const mockResult = {
				staff: {
					id: "staff-1",
					restaurantId: "rest-1",
					fullname: "John Doe",
					email: "john@example.com",
					phone: "+919876543210",
					avatarUrl: null,
					role: "STAFF",
					status: "ACTIVE",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
				accessToken: "new-access-token",
				refreshToken: "new-refresh-token",
			};

			acceptInvitationUseCase.execute.mockResolvedValue(mockResult);

			await controller.acceptInvitation(req as Request, res as Response);

			expect(acceptInvitationUseCase.execute).toHaveBeenCalledWith({
				token: "raw-token-123",
				fullname: "John Doe",
				phone: "+919876543210",
				password: "SecurePassword1!",
			});
			expect(res.cookie).toHaveBeenCalledWith(
				"refreshToken",
				"new-refresh-token",
				expect.objectContaining({
					httpOnly: true,
				}),
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: {
						staff: mockResult.staff,
						accessToken: "new-access-token",
					},
				}),
			);
		});
	});

	describe("resendInvitation", () => {
		it("should resend invitation and return 200", async () => {
			const req: Partial<Request> = {
				body: { email: "staff@example.com" },
				headers: { "x-restaurant-id": "rest-1" },
			};

			const mockResult = {
				id: "inv-1",
				restaurantId: "rest-1",
				email: "staff@example.com",
				status: "PENDING",
				expiresAt: new Date(),
				createdAt: new Date(),
			};

			resendStaffInvitationUseCase.execute.mockResolvedValue(mockResult);

			await controller.resendInvitation(req as Request, res as Response);

			expect(resendStaffInvitationUseCase.execute).toHaveBeenCalledWith({
				email: "staff@example.com",
				restaurantId: "rest-1",
			});
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("revokeInvitation", () => {
		it("should revoke invitation and return 200", async () => {
			const req: Partial<Request> = {
				body: { invitationId: "inv-1" },
				headers: { "x-restaurant-id": "rest-1" },
			};

			const mockResult = {
				revoked: true,
				invitationId: "inv-1",
			};

			revokeStaffInvitationUseCase.execute.mockResolvedValue(mockResult);

			await controller.revokeInvitation(req as Request, res as Response);

			expect(revokeStaffInvitationUseCase.execute).toHaveBeenCalledWith({
				invitationId: "inv-1",
				email: undefined,
				restaurantId: "rest-1",
			});
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("listInvitations", () => {
		it("should throw RestaurantIdRequiredError if header is missing", async () => {
			const req: Partial<Request> = {
				headers: {},
				query: {},
			};

			await expect(
				controller.listInvitations(req as Request, res as Response),
			).rejects.toThrow(RestaurantIdRequiredError);
		});

		it("should forward query params and return paginated invitations", async () => {
			const req: Partial<Request> = {
				headers: { "x-restaurant-id": "rest-1" },
				query: {
					page: 2 as unknown as string,
					limit: 10 as unknown as string,
					status: "PENDING",
					search: "john",
					sortBy: "email",
					sortOrder: "asc",
				} as never,
			};

			const mockResult = {
				invitations: [
					{
						id: "inv-1",
						restaurantId: "rest-1",
						email: "john@example.com",
						status: "PENDING",
						expiresAt: new Date(),
						acceptedAt: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				pagination: {
					page: 2,
					limit: 10,
					total: 15,
					totalPages: 2,
					hasNextPage: false,
					hasPrevPage: true,
				},
			};

			listStaffInvitationsUseCase.execute.mockResolvedValue(mockResult);

			await controller.listInvitations(req as Request, res as Response);

			expect(listStaffInvitationsUseCase.execute).toHaveBeenCalledWith({
				restaurantId: "rest-1",
				page: 2,
				limit: 10,
				status: "PENDING",
				search: "john",
				sortBy: "email",
				sortOrder: "asc",
			});
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("getProfile", () => {
		it("should return staff profile for authenticated user with 200 OK", async () => {
			const req = {
				user: {
					userId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
					restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
					email: "john.doe@spiceroute.com",
					role: "STAFF",
				},
				userId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			};

			const mockProfile = {
				id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
				restaurant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				fullname: "John Doe",
				email: "john.doe@spiceroute.com",
				phone: "+919876543210",
				avatar_url: "restaurants/uuid/staff/uuid_avatar.jpg",
				role: "STAFF",
				status: "ACTIVE",
				created_at: new Date().toISOString(),
			};

			getStaffProfileUseCase.execute.mockResolvedValue(mockProfile);

			await controller.getProfile(req as never, res as Response);

			expect(getStaffProfileUseCase.execute).toHaveBeenCalledWith({
				staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: "Staff profile retrieved successfully",
					data: mockProfile,
					statusCode: 200,
				}),
			);
		});

		it("should return 401 when authenticated user context is missing", async () => {
			const req = {};

			await controller.getProfile(req as never, res as Response);

			expect(getStaffProfileUseCase.execute).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "UNAUTHORIZED",
				}),
			);
		});
	});
});
