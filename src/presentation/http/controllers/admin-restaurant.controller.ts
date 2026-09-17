import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantResponseMapper } from "@/presentation/http/mappers/admin-restaurant-response.mapper.ts";
import type { GetRestaurantDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import type { ListRestaurantsQuery } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantDetailsUseCase)
		private readonly getRestaurantDetailsUseCase: IGetRestaurantDetailsUseCase,
		@inject(TYPES.UseCases.ListRestaurantsUseCase)
		private readonly listRestaurantsUseCase: IListRestaurantsUseCase,
	) {}

	public getRestaurantDetails = async (
		req: Request<GetRestaurantDetailsParam>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const restaurantDetails =
				await this.getRestaurantDetailsUseCase.execute(id);

			sendSuccessResponse(
				res,
				AdminRestaurantResponseMapper.toResponse(restaurantDetails),
				messages.RESTAURANT_DETAILS_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};

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
