import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { ListRestaurantsQuery } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.UseCases.ListRestaurantsUseCase)
		private readonly listRestaurantsUseCase: IListRestaurantsUseCase,
	) {}

	public listRestaurants = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const query = (res.locals.query ?? req.query) as ListRestaurantsQuery;

		const result = await this.listRestaurantsUseCase.execute({
			page: query.page,
			limit: query.limit,
			search: query.search,
			status: query.status,
			plan: query.plan,
			isSubscriptionActive: query.isSubscriptionActive,
			onboardingStatus: query.onboardingStatus,
			createdFrom: query.createdFrom,
			createdTo: query.createdTo,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder,
		});

		sendSuccessResponse(
			res,
			result,
			messages.RESTAURANTS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
