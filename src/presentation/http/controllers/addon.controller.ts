import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AddonController {
	constructor(
		@inject(TYPES.UseCases.CreateAddonUseCase)
		private readonly createAddonUseCase: ICreateAddonUseCase,
		@inject(TYPES.UseCases.ListRestaurantAddonsUseCase)
		private readonly listRestaurantAddonsUseCase: IListRestaurantAddonsUseCase,
	) {}

	public async createAddon(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);
			const {
				name,
				description,
				price,
				image_key,
				imageKey,
				is_available,
				isAvailable,
			} = req.body;

			const result = await this.createAddonUseCase.execute({
				restaurantId,
				name,
				description,
				price: Number(price),
				imageKey: imageKey ?? image_key ?? null,
				isAvailable: isAvailable ?? is_available ?? true,
			});

			sendSuccessResponse(
				res,
				result,
				messages.ADDON_CREATED_SUCCESS,
				HTTP_STATUS.CREATED,
			);
		} catch (error) {
			next(error);
		}
	}

	public async listAddons(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);

			const result =
				await this.listRestaurantAddonsUseCase.execute(restaurantId);

			sendSuccessResponse(
				res,
				result,
				messages.ADDONS_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	}
}
