import { TYPES } from "@di/types.ts";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetRestaurantStatusUseCase } from "@/application/ports/use-cases/get-restaurant-status.use-case.port.ts";
import { ERROR_CODES } from "@/shared/constants/error-code.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "@/shared/response/api-response.ts";

/**
 * Controller handling restaurant onboarding status and subscription state requests.
 */
@injectable()
export class RestaurantStatusController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantStatusUseCase)
		private readonly getRestaurantStatusUseCase: IGetRestaurantStatusUseCase,
	) {}

	getStatus = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = req.headers["x-restaurant-id"] as string | undefined;

		if (!restaurantId) {
			sendErrorResponse(
				res,
				messages.UNAUTHORIZED_RESTAURANT,
				ERROR_CODES.UNAUTHORIZED,
				HTTP_STATUS.UNAUTHORIZED,
			);
			return;
		}

		const statusResult =
			await this.getRestaurantStatusUseCase.execute(restaurantId);

		if (!statusResult) {
			sendErrorResponse(
				res,
				messages.RESTAURANT_NOT_FOUND,
				ERROR_CODES.RESTAURANT_NOT_FOUND,
				HTTP_STATUS.NOT_FOUND,
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
