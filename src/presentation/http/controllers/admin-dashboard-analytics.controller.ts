import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { GetPlatformDashboardAnalyticsQueryDto } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AuthenticatedAdmin } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AdminDashboardAnalyticsController {
	constructor(
		@inject(TYPES.UseCases.GetPlatformDashboardAnalyticsUseCase)
		private readonly getPlatformDashboardAnalyticsUseCase: IGetPlatformDashboardAnalyticsUseCase,
	) {}

	public getDashboardAnalytics = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const query = (res.locals.query ??
				req.query) as GetPlatformDashboardAnalyticsQueryDto;
			const adminUser = req.user as AuthenticatedAdmin | undefined;
			const adminId = adminUser?.userId ?? req.userId;

			const result =
				await this.getPlatformDashboardAnalyticsUseCase.execute(
					query,
					adminId,
				);

			sendSuccessResponse(
				res,
				result,
				messages.PLATFORM_DASHBOARD_ANALYTICS_FETCHED,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
