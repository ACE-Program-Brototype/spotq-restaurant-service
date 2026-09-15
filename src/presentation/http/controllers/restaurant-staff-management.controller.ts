import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IRemoveStaffUseCase } from "@/application/ports/use-cases/remove-staff.use-case.port.ts";
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
 * specifically removing staff members.
 *
 * Adheres to:
 * - Single Responsibility: Handles HTTP translation, parameter extraction, and authorization scoping.
 * - Clean Architecture: Delegates domain and database logic entirely to use cases.
 */
@injectable()
export class RestaurantStaffManagementController {
	constructor(
		@inject(TYPES.RemoveStaffUseCase)
		private readonly removeStaffUseCase: IRemoveStaffUseCase,
	) {}

	/**
	 * Handles DELETE /api/v1/restaurants/:restaurantId/staff/:staffId
	 * Removes a staff member belonging to the authenticated owner's restaurant.
	 *
	 * @param req - Express Request containing restaurantId and staffId in params
	 * @param res - Express Response object
	 */
	public removeStaff = async (req: Request, res: Response): Promise<void> => {
		const authReq = req as AuthenticatedOwnerRequest;
		const authenticatedRestaurantId =
			authReq.user?.restaurantId ||
			authReq.user?.userId ||
			authReq.userId ||
			(req.headers["x-restaurant-id"] as string | undefined) ||
			(req.headers["x-user-id"] as string | undefined);

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

		await this.removeStaffUseCase.execute({
			restaurantId,
			staffId: String(staffId),
		});

		sendSuccessResponse(
			res,
			null,
			messages.STAFF_REMOVED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
