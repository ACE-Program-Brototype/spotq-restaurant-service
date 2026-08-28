import type { CookieOptions, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import type { IRefreshTokenUseCase } from "@/application/ports/use-cases/refresh-token.use-case.port.ts";
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
	) {}

	public login = async (req: Request, res: Response): Promise<void> => {
		const dto: LoginStaffDTO = {
			email: req.body.email,
			password: req.body.password,
		};

		const result = await this.loginStaffUseCase.execute(dto);

		// Set Refresh Token in cookie using environment configuration
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
}
