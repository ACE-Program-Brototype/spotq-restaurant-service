import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetStaffDetailUseCase } from "@/application/ports/use-cases/get-staff-detail.use-case.port.ts";
import type { IRemoveStaffUseCase } from "@/application/ports/use-cases/remove-staff.use-case.port.ts";
import type { IUpdateStaffInfoUseCase } from "@/application/ports/use-cases/update-staff-info.use-case.port.ts";
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
		@inject(TYPES.UpdateStaffInfoUseCase)
		private readonly updateStaffInfoUseCase: IUpdateStaffInfoUseCase,
		@inject(TYPES.RemoveStaffUseCase)
		private readonly removeStaffUseCase: IRemoveStaffUseCase,
	) {}

	public getStaffDetail = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const authReq = req as AuthenticatedOwnerRequest;
		const ownerRestaurantId = authReq.user?.restaurantId;
		const { restaurantId, staffId } = req.params;

		if (!ownerRestaurantId || restaurantId !== ownerRestaurantId) {
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

	public updateStaffInfo = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const authReq = req as AuthenticatedOwnerRequest;
		const authenticatedRestaurantId =
			authReq.user?.restaurantId ||
			(req.headers["x-restaurant-id"] as string | undefined);

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

		const paramRestaurantId = Array.isArray(req.params.restaurantId)
			? req.params.restaurantId[0]
			: req.params.restaurantId;
		const staffId = Array.isArray(req.params.staffId)
			? req.params.staffId[0]
			: req.params.staffId;

		if (paramRestaurantId && paramRestaurantId !== authenticatedRestaurantId) {
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

		const result = await this.updateStaffInfoUseCase.execute({
			restaurantId: paramRestaurantId,
			staffId,
			fullname: req.body?.fullname,
			phone: req.body?.phone,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public removeStaff = async (
		req: Request,
		res: Response,
		next?: NextFunction,
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

			const paramRestaurantId = Array.isArray(req.params.restaurantId)
				? req.params.restaurantId[0]
				: req.params.restaurantId;
			const staffId = Array.isArray(req.params.staffId)
				? req.params.staffId[0]
				: req.params.staffId;

			if (paramRestaurantId && paramRestaurantId !== authenticatedRestaurantId) {
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
				restaurantId: paramRestaurantId || authenticatedRestaurantId,
				staffId: String(staffId),
			});

			sendSuccessResponse(
				res,
				null,
				messages.STAFF_REMOVED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			if (next) {
				next(error);
			} else {
				throw error;
			}
		}
	};
}
