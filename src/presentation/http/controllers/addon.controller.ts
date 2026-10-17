import type { ICreateAddonUseCase } from "@application/ports/use-cases/addon/create-addon.use-case.port";
import type { IDeleteAddonUseCase } from "@application/ports/use-cases/addon/delete-addon.use-case.port";
import type { IListRestaurantAddonsUseCase } from "@application/ports/use-cases/addon/list-restaurant-addons.use-case.port";
import type { IUpdateAddonUseCase } from "@application/ports/use-cases/addon/update-addon.use-case.port";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedUser } from "@/types/express.d.ts";

@injectable()
export class AddonController {
	constructor(
		@inject(TYPES.UseCases.CreateAddonUseCase)
		private readonly createAddonUseCase: ICreateAddonUseCase,
		@inject(TYPES.UseCases.ListRestaurantAddonsUseCase)
		private readonly listRestaurantAddonsUseCase: IListRestaurantAddonsUseCase,
		@inject(TYPES.UseCases.UpdateAddonUseCase)
		private readonly updateAddonUseCase: IUpdateAddonUseCase,
		@inject(TYPES.UseCases.DeleteAddonUseCase)
		private readonly deleteAddonUseCase: IDeleteAddonUseCase,
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
		const user = req.user as AuthenticatedUser | undefined;

		const result = await this.updateAddonUseCase.execute({
			restaurantId,
			addonId,
			name,
			description,
			price,
			imageKey,
			isAvailable,
			...(user?.userId && { userId: user.userId }),
			...(user?.role && { userRole: user.role }),
		});

		sendSuccessResponse(
			res,
			result,
			messages.ADDON_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public deleteAddon = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);
		const addonId = String(req.params.addonId);

		await this.deleteAddonUseCase.execute({
			restaurantId,
			addonId,
		});

		sendSuccessResponse(
			res,
			null,
			messages.ADDON_DELETED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
