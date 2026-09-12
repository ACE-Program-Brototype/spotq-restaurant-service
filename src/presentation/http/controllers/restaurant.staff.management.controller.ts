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
		const authenticatedUserId =
			authReq.user?.userId ??
			authReq.userId ??
			(req.headers["x-user-id"] as string | undefined);

		if (!authenticatedUserId) {
			res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.GATEWAY_UNAUTHORIZED,
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
			return;
		}

		const paramRestaurantId = Array.isArray(req.params.restaurantId)
			? req.params.restaurantId[0]
			: req.params.restaurantId;
		const staffId = Array.isArray(req.params.staffId)
			? req.params.staffId[0]
			: req.params.staffId;

		// ID integrity check: verify that the accessed restaurant matches the authenticated user ID
		if (paramRestaurantId && paramRestaurantId !== authenticatedUserId) {
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
			restaurantId: authenticatedUserId,
			staffId,
		});

		sendSuccessResponse(
			res,
			detail,
			messages.STAFF_DETAIL_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
