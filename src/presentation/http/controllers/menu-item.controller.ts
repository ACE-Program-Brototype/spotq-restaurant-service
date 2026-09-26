import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class MenuItemController {
	constructor(
		@inject(TYPES.UseCases.CreateMenuItemUseCase)
		private readonly createMenuItemUseCase: ICreateMenuItemUseCase,
	) {}

	public async createMenuItem(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const restaurantId = String(req.params.restaurantId);
			const {
				categoryId,
				category_id,
				name,
				description,
				price,
				preparationTime,
				preparation_time,
				calories,
				isVegetarian,
				is_vegetarian,
				isFeatured,
				is_featured,
				isAvailable,
				is_available,
				images,
				variants,
				addons,
			} = req.body;

			const resolvedCategoryId = String(categoryId ?? category_id);

			const mappedImages = (images || []).map(
				(img: {
					objectKey?: string;
					object_key?: string;
					displayOrder?: number;
					display_order?: number;
				}) => ({
					objectKey: String(img.objectKey ?? img.object_key ?? "").trim(),
					displayOrder: img.displayOrder ?? img.display_order,
				}),
			);

			const mappedVariants = (variants || []).map(
				(v: {
					sku?: string | null;
					name: string;
					price: number;
					isDefault?: boolean;
					is_default?: boolean;
				}) => ({
					sku: v.sku ?? null,
					name: v.name,
					price: Number(v.price),
					isDefault: v.isDefault ?? v.is_default ?? false,
				}),
			);

			const mappedAddons = (addons || []).map(
				(a: {
					addonId?: string;
					addon_id?: string;
					priceOverride?: number | null;
					price_override?: number | null;
				}) => ({
					addonId: String(a.addonId ?? a.addon_id ?? "").trim(),
					priceOverride:
						a.priceOverride !== undefined
							? a.priceOverride
							: a.price_override !== undefined
								? a.price_override
								: null,
				}),
			);

			const result = await this.createMenuItemUseCase.execute({
				restaurantId,
				categoryId: resolvedCategoryId,
				name,
				description: description ?? null,
				price:
					price !== undefined && price !== null ? Number(price) : undefined,
				preparationTime:
					preparationTime !== undefined
						? preparationTime
						: preparation_time !== undefined
							? preparation_time
							: null,
				calories: calories !== undefined ? calories : null,
				isVegetarian: isVegetarian ?? is_vegetarian ?? false,
				isFeatured: isFeatured ?? is_featured ?? false,
				isAvailable: isAvailable ?? is_available ?? true,
				images: mappedImages,
				variants: mappedVariants,
				addons: mappedAddons,
			});

			sendSuccessResponse(
				res,
				result,
				messages.MENU_ITEM_CREATED_SUCCESS,
				HTTP_STATUS.CREATED,
			);
		} catch (error) {
			next(error);
		}
	}
}
