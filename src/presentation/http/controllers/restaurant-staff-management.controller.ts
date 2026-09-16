import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IUpdateStaffStatusUseCase } from "@/application/ports/use-cases/update-staff-status.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AuthenticatedOwnerRequest } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	ApiResponse,
	sendSuccessResponse,
} from "@/shared/response/api-response.ts";

/**
 * Controller managing restaurant-side staff operational workflows,
 * specifically staff member activation and deactivation.
 */
@injectable()
export class RestaurantStaffManagementController {
	constructor(
		@inject(TYPES.UpdateStaffStatusUseCase)
		private readonly updateStaffStatusUseCase: IUpdateStaffStatusUseCase,
	) {}

	/**
	 * Handles PATCH /api/v1/restaurants/:restaurantId/staff/:staffId/status
	 * Activates or deactivates a staff member belonging to the authenticated owner's restaurant.
	 *
	 * @param req - Express Request containing restaurantId, staffId in params and status in body
	 * @param res - Express Response object
	 * @param next - Express NextFunction
	 */
	public updateStaffStatus = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const authReq = req as AuthenticatedOwnerRequest;
			const authenticatedRestaurantId = authReq.user?.restaurantId;

			if (!authenticatedRestaurantId) {
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

			const { restaurantId, staffId } = req.params;

			if (restaurantId !== authenticatedRestaurantId) {
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

			const result = await this.updateStaffStatusUseCase.execute({
				restaurantId,
				staffId: String(staffId),
				status: req.body.status,
			});

			sendSuccessResponse(
				res,
				result,
				messages.STAFF_STATUS_UPDATED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
