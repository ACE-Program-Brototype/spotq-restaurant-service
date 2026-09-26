import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import type { IUpdateAddonUseCase } from "@/application/ports/use-cases/update-addon.use-case.port.ts";
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
		@inject(TYPES.UseCases.UpdateAddonUseCase)
		private readonly updateAddonUseCase: IUpdateAddonUseCase,
	) {}

	public createAddon = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);
		const { name, description, price, imageKey, isAvailable } = req.body;

		const result = await this.createAddonUseCase.execute({
			restaurantId,
			name,
			description: description ?? null,
			price: Number(price),
			imageKey: imageKey ?? null,
			isAvailable: isAvailable ?? true,
		});

		sendSuccessResponse(
			res,
			result,
			messages.ADDON_CREATED_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	public listAddons = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);

		const result = await this.listRestaurantAddonsUseCase.execute(restaurantId);

		sendSuccessResponse(
			res,
			result,
			messages.ADDONS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public updateAddon = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);
		const addonId = String(req.params.addonId);
		const { name, description, price, imageKey, isAvailable } = req.body;

		const result = await this.updateAddonUseCase.execute({
			restaurantId,
			addonId,
			name,
			description,
			price,
			imageKey,
			isAvailable,
		});

		sendSuccessResponse(
			res,
			result,
			messages.ADDON_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
