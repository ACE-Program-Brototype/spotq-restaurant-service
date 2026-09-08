import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetRestaurantStatusUseCase } from "@/application/ports/use-cases/get-restaurant-status.use-case.port.ts";
import { TYPES } from "@/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	ApiResponse,
	sendSuccessResponse,
} from "@/shared/response/api-response.ts";

@injectable()
export class RestaurantStatusController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantStatusUseCase)
		private readonly getRestaurantStatusUseCase: IGetRestaurantStatusUseCase,
	) {}

	getStatus = async (req: Request, res: Response): Promise<void> => {
		const restaurantId =
			(req.headers["x-restaurant-id"] as string) ||
			(req.query.restaurantId as string) ||
			(req.headers["x-user-id"] as string);

		if (!restaurantId) {
			res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.UNAUTHORIZED_RESTAURANT,
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
			return;
		}

		const statusResult =
			await this.getRestaurantStatusUseCase.execute(restaurantId);

		if (!statusResult) {
			res
				.status(HTTP_STATUS.NOT_FOUND)
				.json(
					ApiResponse.error(
						messages.RESTAURANT_NOT_FOUND,
						"RESTAURANT_NOT_FOUND",
						HTTP_STATUS.NOT_FOUND,
					),
				);
			return;
		}

		sendSuccessResponse(
			res,
			statusResult,
			messages.RESTAURANT_STATUS_FETCHED,
			HTTP_STATUS.OK,
		);
	};
}

