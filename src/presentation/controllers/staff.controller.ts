import type { CookieOptions, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type { IForgotPasswordUseCase } from "@/application/ports/use-cases/forgot-password.use-case.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
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

		// Set tempToken in cookie (15 minutes expiry)
		const cookieOptions: CookieOptions = {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: 15 * 60 * 1000, // 15 minutes
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
}
