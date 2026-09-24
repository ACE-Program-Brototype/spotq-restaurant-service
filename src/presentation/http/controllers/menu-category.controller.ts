import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IListMenuCategoriesUseCase } from "@/application/ports/use-cases/list-menu-categories.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuCategoryController {
	constructor(
		@inject(TYPES.UseCases.CreateMenuCategoryUseCase)
		private readonly createMenuCategoryUseCase: ICreateMenuCategoryUseCase,
		@inject(TYPES.UseCases.ListMenuCategoriesUseCase)
		private readonly listMenuCategoriesUseCase: IListMenuCategoriesUseCase,
	) {}

	public async createCategory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);
			const { name, description, displayOrder } = req.body;

			const result = await this.createMenuCategoryUseCase.execute({
				restaurantId,
				name,
				description,
				displayOrder,
			});

			sendSuccessResponse(
				res,
				result,
				messages.MENU_CATEGORY_CREATED_SUCCESS,
				HTTP_STATUS.CREATED,
			);
		} catch (error) {
			next(error);
		}
	}

	public async listCategories(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);

			const result =
				await this.listMenuCategoriesUseCase.execute(restaurantId);

			sendSuccessResponse(
				res,
				result,
				messages.MENU_CATEGORIES_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	}
}
