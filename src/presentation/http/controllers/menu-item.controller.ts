import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { MenuItemStatusFilter } from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import type { IGetMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-menu-item-details.use-case.port.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import type { IListStaffMenuItemsUseCase } from "@/application/ports/use-cases/list-staff-menu-items.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type {
	MenuItemSortField,
	SortOrder,
} from "@/domain/constants/menu-item.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedUser } from "@/types/express.d.ts";

@injectable()
export class MenuItemController {
	constructor(
		@inject(TYPES.UseCases.CreateMenuItemUseCase)
		private readonly createMenuItemUseCase: ICreateMenuItemUseCase,
		@inject(TYPES.UseCases.ListMenuItemsUseCase)
		private readonly listMenuItemsUseCase: IListMenuItemsUseCase,
		@inject(TYPES.UseCases.GetMenuItemDetailsUseCase)
		private readonly getMenuItemDetailsUseCase: IGetMenuItemDetailsUseCase,
		@inject(TYPES.UseCases.ListStaffMenuItemsUseCase)
		private readonly listStaffMenuItemsUseCase: IListStaffMenuItemsUseCase,
	) {}

	public createMenuItem = async (
		req: Request,
		res: Response,
	): Promise<void> => {
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
			description: String(description ?? "").trim(),
			price: price !== undefined && price !== null ? Number(price) : undefined,
			preparationTime:
				preparationTime !== undefined
					? Number(preparationTime)
					: Number(preparation_time),
			calories: calories !== undefined ? calories : null,
			isVegetarian:
				isVegetarian !== undefined
					? Boolean(isVegetarian)
					: Boolean(is_vegetarian),
			isFeatured: isFeatured ?? is_featured ?? false,
			isAvailable:
				isAvailable !== undefined
					? Boolean(isAvailable)
					: is_available !== undefined
						? Boolean(is_available)
						: true,
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
	};

	public listMenuItems = async (req: Request, res: Response): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);

		const validatedQuery = (res.locals?.query ?? req.query) as
			| Record<string, unknown>
			| undefined;

		const pageVal = validatedQuery?.page;
		const limitVal = validatedQuery?.limit;
		const minPriceVal = validatedQuery?.minPrice ?? validatedQuery?.min_price;
		const maxPriceVal = validatedQuery?.maxPrice ?? validatedQuery?.max_price;
		const isVegetarianVal =
			validatedQuery?.isVegetarian ?? validatedQuery?.is_vegetarian;
		const isFeaturedVal =
			validatedQuery?.isFeatured ?? validatedQuery?.is_featured;

		const parseBool = (val: unknown): boolean | undefined => {
			if (typeof val === "boolean") return val;
			if (val === "true") return true;
			if (val === "false") return false;
			return undefined;
		};

		const result = await this.listMenuItemsUseCase.execute({
			restaurantId,
			page:
				typeof pageVal === "number"
					? pageVal
					: pageVal !== undefined
						? Number(pageVal)
						: 1,
			limit:
				typeof limitVal === "number"
					? limitVal
					: limitVal !== undefined
						? Number(limitVal)
						: 10,
			search: validatedQuery?.search as string | undefined,
			categoryId: (validatedQuery?.categoryId ?? validatedQuery?.category_id) as
				| string
				| undefined,
			status: validatedQuery?.status as MenuItemStatusFilter | undefined,
			minPrice: minPriceVal !== undefined ? Number(minPriceVal) : undefined,
			maxPrice: maxPriceVal !== undefined ? Number(maxPriceVal) : undefined,
			isVegetarian: parseBool(isVegetarianVal),
			isFeatured: parseBool(isFeaturedVal),
			sortBy: (validatedQuery?.sortBy ?? validatedQuery?.sort_by) as
				| MenuItemSortField
				| undefined,
			sortOrder: (validatedQuery?.sortOrder ?? validatedQuery?.sort_order) as
				| SortOrder
				| undefined,
		});

		sendSuccessResponse(
			res,
			result,
			messages.MENU_ITEMS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public getMenuItemDetails = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);
		const menuItemId = String(req.params.menuItemId ?? req.params.id);

		const result = await this.getMenuItemDetailsUseCase.execute({
			restaurantId,
			menuItemId,
		});

		sendSuccessResponse(
			res,
			result,
			messages.MENU_ITEM_DETAILS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public listStaffMenuItems = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const restaurantId = String(req.params.restaurantId);

		const validatedQuery = (res.locals?.query ?? req.query) as
			| Record<string, unknown>
			| undefined;

		const pageVal = validatedQuery?.page;
		const limitVal = validatedQuery?.limit;
		const userRole =
			(req.user as AuthenticatedUser | undefined)?.role ||
			(req.headers["x-user-role"] as string | undefined);

		const result = await this.listStaffMenuItemsUseCase.execute({
			restaurantId,
			page:
				typeof pageVal === "number"
					? pageVal
					: pageVal !== undefined
						? Number(pageVal)
						: 1,
			limit:
				typeof limitVal === "number"
					? limitVal
					: limitVal !== undefined
						? Number(limitVal)
						: 50,
			search: validatedQuery?.search as string | undefined,
			categoryId: (validatedQuery?.categoryId ?? validatedQuery?.category_id) as
				| string
				| undefined,
			isAvailable: validatedQuery?.isAvailable as boolean | undefined,
			includeInactive: Boolean(
				validatedQuery?.includeInactive ?? validatedQuery?.include_inactive,
			),
			includeVariants:
				validatedQuery?.includeVariants !== undefined
					? Boolean(validatedQuery.includeVariants)
					: validatedQuery?.include_variants !== undefined
						? Boolean(validatedQuery.include_variants)
						: true,
			sortBy: (validatedQuery?.sortBy ?? validatedQuery?.sort_by) as
				| string
				| undefined,
			sortOrder: (validatedQuery?.sortOrder ?? validatedQuery?.sort_order) as
				| "asc"
				| "desc"
				| undefined,
			userRole,
		});

		sendSuccessResponse(
			res,
			result,
			messages.STAFF_MENU_ITEMS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};
}
