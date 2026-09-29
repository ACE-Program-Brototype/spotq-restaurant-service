import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IListRestaurantMenuCategoriesUseCase } from "@/application/ports/use-cases/list-restaurant-menu-categories.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { ListRestaurantMenuCategoriesUseCase } from "@/application/use-cases/list-restaurant-menu-categories.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuCategoryController {
	private readonly createMenuCategoryUseCase!: ICreateMenuCategoryUseCase;
	private readonly updateMenuCategoryUseCase!: IUpdateMenuCategoryUseCase;
	private readonly listRestaurantMenuCategoriesUseCase!: IListRestaurantMenuCategoriesUseCase;

	constructor(
		@inject(TYPES.UseCases.CreateMenuCategoryUseCase)
		createUseCaseOrAny: ICreateMenuCategoryUseCase,
		@inject(TYPES.UseCases.UpdateMenuCategoryUseCase)
		updateOrListUseCase?:
			| IUpdateMenuCategoryUseCase
			| IListRestaurantMenuCategoriesUseCase,
		@inject(TYPES.UseCases.ListRestaurantMenuCategoriesUseCase)
		listUseCase?: IListRestaurantMenuCategoriesUseCase,
	) {
		if (listUseCase) {
			this.createMenuCategoryUseCase = createUseCaseOrAny;
			this.updateMenuCategoryUseCase =
				updateOrListUseCase as IUpdateMenuCategoryUseCase;
			this.listRestaurantMenuCategoriesUseCase = listUseCase;
		} else {
			this.createMenuCategoryUseCase = createUseCaseOrAny;
			if (
				updateOrListUseCase instanceof ListRestaurantMenuCategoriesUseCase ||
				updateOrListUseCase?.constructor?.name ===
					"ListRestaurantMenuCategoriesUseCase"
			) {
				this.listRestaurantMenuCategoriesUseCase =
					updateOrListUseCase as IListRestaurantMenuCategoriesUseCase;
			} else if (updateOrListUseCase) {
				this.updateMenuCategoryUseCase =
					updateOrListUseCase as IUpdateMenuCategoryUseCase;
			}
		}
	}

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

	public listRestaurantCategories = async (
		req: Request,
		res: Response,
		next?: (err: unknown) => void,
	): Promise<Response | undefined> => {
		try {
			const restaurantId = String(req.params.restaurantId);
			const result =
				await this.listRestaurantMenuCategoriesUseCase.execute({
					restaurantId,
				});

			return sendSuccessResponse(
				res,
				result,
				messages.MENU_CATEGORIES_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			if (typeof next === "function") {
				next(error);
				return;
			}
			throw error;
		}
	};
}
