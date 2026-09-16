import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantResponseMapper } from "@/presentation/http/mappers/admin-restaurant-response.mapper.ts";
import type { GetRestaurantDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantDetailsUseCase)
		private readonly getRestaurantDetailsUseCase: IGetRestaurantDetailsUseCase,
	) {}

	getRestaurantDetails = async (
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
}

