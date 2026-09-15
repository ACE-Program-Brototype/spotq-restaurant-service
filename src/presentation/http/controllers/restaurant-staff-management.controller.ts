import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetStaffDetailUseCase } from "@/application/ports/use-cases/get-staff-detail.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AuthenticatedOwnerRequest } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	ApiResponse,
	sendSuccessResponse,
} from "@/shared/response/api-response.ts";

@injectable()
export class RestaurantStaffManagementController {
	constructor(
		@inject(TYPES.GetStaffDetailUseCase)
		private readonly getStaffDetailUseCase: IGetStaffDetailUseCase,
	) {}

	public getStaffDetail = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const authReq = req as AuthenticatedOwnerRequest;
		const ownerRestaurantId =
			authReq.user?.restaurantId || authReq.user?.userId;
		const { restaurantId, staffId } = req.params;

		if (restaurantId !== ownerRestaurantId) {
			res
				.status(HTTP_STATUS.FORBIDDEN)
				.json(
					ApiResponse.error(
						messages.RESTAURANT_ACCESS_FORBIDDEN,
						"FORBIDDEN",
						HTTP_STATUS.FORBIDDEN,
					),
				);
			return;
		}

		const detail = await this.getStaffDetailUseCase.execute({
			restaurantId,
			staffId: String(staffId),
		});

		sendSuccessResponse(
			res,
			detail,
			messages.STAFF_DETAIL_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
