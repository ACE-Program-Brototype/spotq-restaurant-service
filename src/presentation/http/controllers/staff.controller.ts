import type { CookieOptions, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type { IAcceptInvitationUseCase } from "@/application/ports/use-cases/accept-invitation.use-case.port.ts";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port.ts";
import type { IInviteStaffUseCase } from "@/application/ports/use-cases/invite-staff.use-case.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import type { IResendStaffInvitationUseCase } from "@/application/ports/use-cases/resend-invitation.use-case.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import type { IRevokeStaffInvitationUseCase } from "@/application/ports/use-cases/revoke-invitation.use-case.port.ts";
import type { IValidateInvitationUseCase } from "@/application/ports/use-cases/validate-invitation.use-case.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { RestaurantIdRequiredError } from "@/domain/errors/staff.errors.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class StaffController {
	constructor(
		@inject(TYPES.LoginStaffUseCase)
		private readonly loginStaffUseCase: ILoginStaffUseCase,
		@inject(TYPES.LogoutStaffUseCase)
		private readonly logoutStaffUseCase: ILogoutStaffUseCase,
		@inject(TYPES.RefreshTokenUseCase)
		private readonly refreshTokenUseCase: IRefreshTokenUseCase,
		@inject(TYPES.ForgotPasswordUseCase)
		private readonly forgotPasswordUseCase: IForgotPasswordUseCase,
		@inject(TYPES.VerifyForgotPasswordOtpUseCase)
		private readonly verifyForgotPasswordOtpUseCase: IVerifyForgotPasswordOtpUseCase,
		@inject(TYPES.ResendForgotPasswordOtpUseCase)
		private readonly resendForgotPasswordOtpUseCase: IResendForgotPasswordOtpUseCase,
		@inject(TYPES.ResetPasswordUseCase)
		private readonly resetPasswordUseCase: IResetPasswordUseCase,
		@inject(TYPES.InviteStaffUseCase)
		private readonly inviteStaffUseCase: IInviteStaffUseCase,
		@inject(TYPES.ValidateInvitationUseCase)
		private readonly validateInvitationUseCase: IValidateInvitationUseCase,
		@inject(TYPES.AcceptInvitationUseCase)
		private readonly acceptInvitationUseCase: IAcceptInvitationUseCase,
		@inject(TYPES.ResendStaffInvitationUseCase)
		private readonly resendStaffInvitationUseCase: IResendStaffInvitationUseCase,
		@inject(TYPES.RevokeStaffInvitationUseCase)
		private readonly revokeStaffInvitationUseCase: IRevokeStaffInvitationUseCase,
	) {}

	public login = async (req: Request, res: Response): Promise<void> => {
		const dto: LoginStaffDTO = {
			email: req.body.email,
			password: req.body.password,
		};

		const result = await this.loginStaffUseCase.execute(dto);

		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: env.COOKIE_MAX_AGE_MS,
			path: env.COOKIE_PATH,
			...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
		};

		res.cookie(
			env.COOKIE_NAME_REFRESH_TOKEN,
			result.refreshToken,
			cookieOptions,
		);

		sendSuccessResponse(
			res,
			{
				staff: result.staff,
				accessToken: result.accessToken,
			},
			messages.STAFF_LOGIN_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public logout = async (req: Request, res: Response): Promise<void> => {
		const refreshToken = req.cookies?.[env.COOKIE_NAME_REFRESH_TOKEN];

		await this.logoutStaffUseCase.execute({ refreshToken });

		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			path: env.COOKIE_PATH,
			...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
		};

		res.clearCookie(env.COOKIE_NAME_REFRESH_TOKEN, cookieOptions);

		sendSuccessResponse(
			res,
			null,
			messages.STAFF_LOGOUT_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public refreshToken = async (req: Request, res: Response): Promise<void> => {
		const refreshToken =
			req.cookies?.[env.COOKIE_NAME_REFRESH_TOKEN] || req.body?.refreshToken;

		const result = await this.refreshTokenUseCase.execute({ refreshToken });

		sendSuccessResponse(
			res,
			{
				accessToken: result.accessToken,
			},
			messages.STAFF_TOKEN_REFRESH_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public forgotPassword = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		await this.forgotPasswordUseCase.execute({
			email: req.body.email,
		});

		sendSuccessResponse(res, null, messages.OTP_SENT_SUCCESS, HTTP_STATUS.OK);
	};

	public verifyForgotPasswordOtp = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const result = await this.verifyForgotPasswordOtpUseCase.execute({
			email: req.body.email,
			otp: req.body.otp,
		});

		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: env.COOKIE_TEMP_TOKEN_MAX_AGE_MS,
			path: env.COOKIE_PATH,
			...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
		};

		res.cookie(env.COOKIE_NAME_TEMP_TOKEN, result.tempToken, cookieOptions);

		sendSuccessResponse(
			res,
			null,
			messages.OTP_VERIFIED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public resendForgotPasswordOtp = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		await this.resendForgotPasswordOtpUseCase.execute({
			email: req.body.email,
		});

		sendSuccessResponse(res, null, messages.OTP_RESENT_SUCCESS, HTTP_STATUS.OK);
	};

	public resetPassword = async (req: Request, res: Response): Promise<void> => {
		const tempToken = req.cookies?.[env.COOKIE_NAME_TEMP_TOKEN];

		await this.resetPasswordUseCase.execute({
			password: req.body.password,
			tempToken,
		});

		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			path: env.COOKIE_PATH,
			...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
		};

		res.clearCookie(env.COOKIE_NAME_TEMP_TOKEN, cookieOptions);

		sendSuccessResponse(
			res,
			null,
			messages.PASSWORD_RESET_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public inviteStaff = async (req: Request, res: Response): Promise<void> => {
		const restaurantId =
			(req.headers["x-restaurant-id"] as string)?.trim() ||
			(req.headers["x-user-id"] as string)?.trim();

		if (!restaurantId) {
			throw new RestaurantIdRequiredError(messages.RESTAURANT_ID_REQUIRED);
		}

		const result = await this.inviteStaffUseCase.execute({
			email: req.body.email,
			restaurantId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_INVITATION_SENT_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	public validateInvitation = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const result = await this.validateInvitationUseCase.execute({
			token: req.body.token,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_INVITATION_VALID,
			HTTP_STATUS.OK,
		);
	};

	public acceptInvitation = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const result = await this.acceptInvitationUseCase.execute({
			token: req.body.token,
			fullname: req.body.fullname,
			phone: req.body.phone,
			password: req.body.password,
		});

		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: env.COOKIE_MAX_AGE_MS,
			path: env.COOKIE_PATH,
			...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
		};

		res.cookie(
			env.COOKIE_NAME_REFRESH_TOKEN,
			result.refreshToken,
			cookieOptions,
		);

		sendSuccessResponse(
			res,
			{
				staff: result.staff,
				accessToken: result.accessToken,
			},
			messages.STAFF_INVITATION_ACCEPTED_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	public resendInvitation = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const restaurantId =
			(req.headers["x-restaurant-id"] as string)?.trim() ||
			(req.headers["x-user-id"] as string)?.trim();

		if (!restaurantId) {
			throw new RestaurantIdRequiredError(messages.RESTAURANT_ID_REQUIRED);
		}

		const result = await this.resendStaffInvitationUseCase.execute({
			email: req.body.email,
			restaurantId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_INVITATION_RESENT_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public revokeInvitation = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const restaurantId =
			(req.headers["x-restaurant-id"] as string)?.trim() ||
			(req.headers["x-user-id"] as string)?.trim();

		if (!restaurantId) {
			throw new RestaurantIdRequiredError(messages.RESTAURANT_ID_REQUIRED);
		}

		const result = await this.revokeStaffInvitationUseCase.execute({
			invitationId: req.body.invitationId,
			email: req.body.email,
			restaurantId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_INVITATION_REVOKED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
