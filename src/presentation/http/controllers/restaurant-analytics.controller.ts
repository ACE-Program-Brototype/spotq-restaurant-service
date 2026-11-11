import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { GetRestaurantAnalyticsDashboardInputDTO } from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class RestaurantAnalyticsController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantAnalyticsDashboardUseCase)
		private readonly getRestaurantAnalyticsDashboardUseCase: IGetRestaurantAnalyticsDashboardUseCase,
	) {}

	public getRestaurantAnalyticsDashboard = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const params = (res.locals.params ?? req.params) as {
				restaurantId: string;
			};
			const query = (res.locals.query ?? req.query) as Omit<
				GetRestaurantAnalyticsDashboardInputDTO,
				"restaurantId"
			>;

			const result = await this.getRestaurantAnalyticsDashboardUseCase.execute(
				params.restaurantId,
				query,
			);

			sendSuccessResponse(
				res,
				result,
				messages.RESTAURANT_ANALYTICS_DASHBOARD_FETCHED,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
