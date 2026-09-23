import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuCategoryController {
	constructor(
		@inject(TYPES.UseCases.CreateMenuCategoryUseCase)
		private readonly createMenuCategoryUseCase: ICreateMenuCategoryUseCase,
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
}
