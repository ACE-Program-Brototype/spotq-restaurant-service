import { inject, injectable } from "inversify";
import type { MenuItemResponseDto } from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { UpdateMenuItemInputDto } from "@/application/dtos/menu-item/update-menu-item.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateMenuItemUseCase } from "@/application/ports/use-cases/update-menu-item.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidMenuItemDataError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
	MenuItemNotFoundError,
} from "@/domain/errors/menu-item.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateMenuItemUseCase implements IUpdateMenuItemUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepository,
		@inject(TYPES.Repositories.AddonRepository)
		private readonly addonRepository: IAddonRepository,
	) {}

	public async execute(
		input: UpdateMenuItemInputDto,
	): Promise<MenuItemResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError(
				messages.RESTAURANT_ACCOUNT_BLOCKED,
			);
		}

		const existingDetails =
			await this.menuItemRepository.findByIdAndRestaurantId(
				input.menuItemId,
				input.restaurantId,
			);
		if (!existingDetails || existingDetails.item.isDeleted) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		if (
			input.categoryId &&
			input.categoryId !== existingDetails.item.categoryId
		) {
			const category = await this.menuCategoryRepository.findById(
				input.categoryId,
			);
			if (
				!category ||
				category.restaurantId !== input.restaurantId ||
				category.isDeleted ||
				!category.isActive
			) {
				throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
			}
		}

		let trimmedName: string | undefined;
		if (input.name !== undefined) {
			trimmedName = input.name.trim();
			if (
				trimmedName.toLowerCase() !== existingDetails.item.name.toLowerCase()
			) {
				const duplicate =
					await this.menuItemRepository.findByNameAndRestaurantId(
						trimmedName,
						input.restaurantId,
					);
				if (duplicate && duplicate.id !== input.menuItemId) {
					throw new MenuItemAlreadyExistsError(
						messages.MENU_ITEM_ALREADY_EXISTS,
					);
				}
			}
		}

		let preparedAddons:
			| Array<{ addonId: string; priceOverride: number | null }>
			| undefined;

		if (input.addons !== undefined) {
			preparedAddons = [];
			if (input.addons.length > 0) {
				const addonIds = Array.from(
					new Set(input.addons.map((a) => a.addonId.trim())),
				);
				if (addonIds.length !== input.addons.length) {
					throw new InvalidMenuItemDataError(
						messages.DUPLICATE_ADDON_IN_MENU_ITEM,
					);
				}
				const existingAddons =
					await this.addonRepository.findByIdsAndRestaurantId(
						addonIds,
						input.restaurantId,
					);
				if (existingAddons.length !== addonIds.length) {
					throw new AddonNotFoundForRestaurantError(
						messages.ADDON_NOT_FOUND_FOR_RESTAURANT,
					);
				}

				input.addons.forEach((addon) => {
					preparedAddons?.push({
						addonId: addon.addonId.trim(),
						priceOverride:
							addon.priceOverride !== undefined && addon.priceOverride !== null
								? addon.priceOverride
								: null,
					});
				});
			}
		}

		let preparedVariants: MenuItemVariant[] | undefined;
		let resolvedPrice = input.price;

		const existingVariantMap = new Map(
			existingDetails.variants.map((v) => [v.id, v]),
		);

		if (input.variants !== undefined) {
			if (input.variants.length === 0) {
				throw new InvalidVariantDataError(messages.INVALID_VARIANT_DATA);
			}

			preparedVariants = [];
			const variantIds = input.variants
				.map((v) => v.id?.trim())
				.filter((id): id is string => Boolean(id));
			if (new Set(variantIds).size !== variantIds.length) {
				throw new InvalidVariantDataError(
					messages.DUPLICATE_VARIANT_IN_MENU_ITEM,
				);
			}

			for (const v of input.variants) {
				if (v.id && !existingVariantMap.has(v.id)) {
					throw new InvalidVariantDataError(messages.INVALID_VARIANT_DATA);
				}
			}

			const defaultCount = input.variants.filter((v) => v.isDefault).length;
			if (defaultCount > 1) {
				throw new InvalidVariantDataError(messages.MULTIPLE_DEFAULT_VARIANTS);
			}

			input.variants.forEach((v, index) => {
				const isDefault =
					defaultCount === 0 ? index === 0 : (v.isDefault ?? false);
				const existingVariant = v.id ? existingVariantMap.get(v.id) : undefined;
				const isAvailable =
					v.isAvailable !== undefined
						? v.isAvailable
						: existingVariant
							? existingVariant.isAvailable
							: input.isAvailable !== undefined
								? input.isAvailable
								: existingDetails.item.isAvailable;

				if (existingVariant) {
					existingVariant.update({
						name: v.name,
						price: v.price,
						sku: v.sku,
						isDefault,
						isAvailable,
					});
					preparedVariants?.push(existingVariant);
				} else {
					preparedVariants?.push(
						MenuItemVariant.create({
							menuItemId: input.menuItemId,
							sku: v.sku,
							name: v.name,
							price: v.price,
							isDefault,
							isAvailable,
						}),
					);
				}
			});

			const defaultVariant =
				preparedVariants.find((v) => v.isDefault) ?? preparedVariants[0];
			resolvedPrice = defaultVariant.price;
		} else if (input.price !== undefined) {
			if (existingDetails.variants.length > 0) {
				const defaultVariant =
					existingDetails.variants.find((v) => v.isDefault) ??
					existingDetails.variants[0];
				defaultVariant.update({ price: input.price });
				preparedVariants = existingDetails.variants;
			}
		}

		let preparedImages:
			| Array<{ id?: string; objectKey: string; displayOrder: number }>
			| undefined;

		if (input.images !== undefined) {
			const existingImageIdSet = new Set(
				existingDetails.images.map((img) => img.id),
			);

			for (const img of input.images) {
				if (img.id && !existingImageIdSet.has(img.id)) {
					throw new InvalidMenuItemDataError(
						messages.INVALID_MENU_ITEM_IMAGE_ID,
					);
				}
			}

			preparedImages = input.images.map((img, index) => ({
				id: img.id,
				objectKey: img.objectKey.trim(),
				displayOrder: img.displayOrder ?? index,
			}));
		}

		const menuItem = existingDetails.item;
		menuItem.update({
			categoryId: input.categoryId,
			name: trimmedName,
			description: input.description,
			price: resolvedPrice,
			preparationTime: input.preparationTime,
			calories: input.calories,
			isVegetarian: input.isVegetarian,
			isFeatured: input.isFeatured,
			isAvailable: input.isAvailable,
		});

		const aggregate = await this.menuItemRepository.updateWithDetails({
			menuItem,
			images: preparedImages,
			variants: preparedVariants,
			addons: preparedAddons,
		});

		return MenuItemMapper.toResponseDto(aggregate);
	}
}
