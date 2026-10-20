import type { GetCustomerRestaurantDetailsUseCase } from "@application/use-cases/restaurant/get-customer-restaurant-details.use-case";
import type { ListCustomerRestaurantsUseCase } from "@application/use-cases/restaurant/list-customer-restaurant.use-case";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type {
	GetCustomerRestaurantDetailsParams,
	GetCustomerRestaurantDetailsQuery,
} from "@/presentation/http/validators/get-customer-restaurant-details.validator.ts";
import type { ListCustomerRestaurantsQuery } from "@/presentation/http/validators/list-customer-restaurants.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	sendPaginatedSuccessResponse,
	sendSuccessResponse,
} from "@/shared/response/api-response.ts";

@injectable()
export class CustomerRestaurantController {
	constructor(
		@inject(TYPES.UseCases.ListCustomerRestaurantsUseCase)
		private readonly listCustomerRestaurantsUseCase: ListCustomerRestaurantsUseCase,
		@inject(TYPES.UseCases.GetCustomerRestaurantDetailsUseCase)
		private readonly getCustomerRestaurantDetailsUseCase: GetCustomerRestaurantDetailsUseCase,
	) {}

	public listRestaurants = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const query = (res.locals?.query ??
			req.query) as ListCustomerRestaurantsQuery;

		const result = await this.listCustomerRestaurantsUseCase.execute(query);

		return sendPaginatedSuccessResponse(
			res,
			result.data,
			{
				page: result.pagination.page,
				limit: result.pagination.limit,
				total: result.pagination.total,
				totalPages: result.pagination.totalPages,
			},
			messages.SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public getRestaurantDetails = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const { restaurantId } = (req.params) as GetCustomerRestaurantDetailsParams;
		const { includeMenu, categoryId } = (res.locals?.query ??
			req.query) as GetCustomerRestaurantDetailsQuery;

		const result = await this.getCustomerRestaurantDetailsUseCase.execute({
			restaurantId,
			includeMenu,
			categoryId
		});

		return sendSuccessResponse(res, result, messages.SUCCESS, HTTP_STATUS.OK);
	};
}
