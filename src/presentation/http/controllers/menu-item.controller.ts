import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { ListMenuItemsQuery } from "@/presentation/http/validators/list-menu-items.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuItemController {
	constructor(
		@inject(TYPES.UseCases.ListMenuItemsUseCase)
		private readonly listMenuItemsUseCase: IListMenuItemsUseCase,
	) {}

	public listMenuItems = async (req: Request, res: Response): Promise<void> => {
		const restaurantId =
			(req.params?.restaurantId as string) ||
			req.user?.restaurantId ||
			req.userId ||
			"";
		// validated and transformed query is attached via validation middleware into res.locals.query
		const validatedQuery =
			(res.locals?.query as ListMenuItemsQuery) ??
			(req.query as unknown as ListMenuItemsQuery) ??
			{};

		const result = await this.listMenuItemsUseCase.execute({
			restaurantId,
			page: validatedQuery.page,
			limit: validatedQuery.limit,
			search: validatedQuery.search,
			categoryId: validatedQuery.categoryId,
			status: validatedQuery.status,
			minPrice: validatedQuery.minPrice,
			maxPrice: validatedQuery.maxPrice,
			isVegetarian: validatedQuery.isVegetarian,
			isFeatured: validatedQuery.isFeatured,
			sortBy: validatedQuery.sortBy,
			sortOrder: validatedQuery.sortOrder,
		});

		sendSuccessResponse(
			res,
			result,
			messages.MENU_ITEMS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
