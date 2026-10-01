import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IDeleteMenuCategoryUseCase } from "@/application/ports/use-cases/delete-menu-category.use-case.port.ts";
import type { IUpdateMenuCategoryStatusUseCase } from "@/application/ports/use-cases/update-menu-category-status.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuCategoryController {
	constructor(
		@inject(TYPES.UseCases.CreateMenuCategoryUseCase)
		private readonly createMenuCategoryUseCase: ICreateMenuCategoryUseCase,
		@inject(TYPES.UseCases.UpdateMenuCategoryUseCase)
		private readonly updateMenuCategoryUseCase: IUpdateMenuCategoryUseCase,
		@inject(TYPES.UseCases.DeleteMenuCategoryUseCase)
		private readonly deleteMenuCategoryUseCase: IDeleteMenuCategoryUseCase,
		@inject(TYPES.UseCases.UpdateMenuCategoryStatusUseCase)
		private readonly updateMenuCategoryStatusUseCase: IUpdateMenuCategoryStatusUseCase,
	) {}

	public createCategory = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const restaurantId = String(req.params.restaurantId);
		const { name, description, displayOrder } = req.body;

		const result = await this.createMenuCategoryUseCase.execute({
			restaurantId,
			name,
			description,
			displayOrder,
		});

		return sendSuccessResponse(
			res,
			result,
			messages.MENU_CATEGORY_CREATED_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	};

	public updateCategory = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const restaurantId = String(req.params.restaurantId);
		const categoryId = String(req.params.categoryId);
		const { name, description, displayOrder, isActive } = req.body;

		const result = await this.updateMenuCategoryUseCase.execute({
			restaurantId,
			categoryId,
			name,
			description,
			displayOrder,
			isActive,
		});

		return sendSuccessResponse(
			res,
			result,
			messages.MENU_CATEGORY_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public updateCategoryStatus = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const restaurantId = String(req.params.restaurantId);
		const categoryId = String(req.params.categoryId);
		const { isActive } = req.body;

		const result = await this.updateMenuCategoryStatusUseCase.execute({
			restaurantId,
			categoryId,
			isActive,
		});

		return sendSuccessResponse(
			res,
			result,
			messages.MENU_CATEGORY_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public deleteCategory = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const restaurantId = String(req.params.restaurantId);
		const categoryId = String(req.params.categoryId);

		await this.deleteMenuCategoryUseCase.execute({
			restaurantId,
			categoryId,
		});

		return sendSuccessResponse(
			res,
			null,
			messages.MENU_CATEGORY_DELETED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
