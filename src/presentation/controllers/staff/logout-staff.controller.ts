import type { CookieOptions, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ILogoutStaffUseCase } from "@/application/ports/use-cases/logout-staff.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class LogoutStaffController {
	constructor(
		@inject(TYPES.LogoutStaffUseCase)
		private readonly logoutStaffUseCase: ILogoutStaffUseCase,
	) {}

	public handle = async (req: Request, res: Response): Promise<void> => {
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
}
