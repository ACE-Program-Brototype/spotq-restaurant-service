import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IValidateRestaurantEligibilityUseCase } from "@/application/ports/use-cases/validate-restaurant-eligibility.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class InternalRestaurantController {
	constructor(
		@inject(TYPES.UseCases.ValidateRestaurantEligibilityUseCase)
		private readonly validateRestaurantEligibilityUseCase: IValidateRestaurantEligibilityUseCase,
	) {}

	async validateRestaurant(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);
			const validationData =
				await this.validateRestaurantEligibilityUseCase.execute(restaurantId);

			sendSuccessResponse(
				res,
				validationData,
				messages.RESTAURANT_STATUS_AND_SUBSCRIPTION_VERIFIED,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	}
}
