import { inject, injectable } from "inversify";
import type {
	CreateMenuItemInputDto,
	MenuItemResponseDto,
} from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
} from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class CreateMenuItemUseCase implements ICreateMenuItemUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		input: CreateMenuItemInputDto,
	): Promise<MenuItemResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const categoryExists =
			await this.menuItemRepository.verifyCategoryBelongsToRestaurant(
				input.categoryId,
				input.restaurantId,
			);
		if (!categoryExists) {
			throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
		}

		const trimmedName = input.name.trim();
		const existingItem =
			await this.menuItemRepository.findByNameAndRestaurantId(
				trimmedName,
				input.restaurantId,
			);
		if (existingItem) {
			throw new MenuItemAlreadyExistsError(messages.MENU_ITEM_ALREADY_EXISTS);
		}

		const preparedAddons: Array<{
			addonId: string;
			priceOverride: number | null;
			displayOrder: number;
		}> = [];

		if (input.addons && input.addons.length > 0) {
			const addonIds = Array.from(
				new Set(input.addons.map((a) => a.addonId.trim())),
			);
			const allBelong =
				await this.menuItemRepository.verifyAddonsBelongToRestaurant(
					addonIds,
					input.restaurantId,
				);
			if (!allBelong) {
				throw new AddonNotFoundForRestaurantError(
					messages.ADDON_NOT_FOUND_FOR_RESTAURANT,
				);
			}

			input.addons.forEach((addon, index) => {
				preparedAddons.push({
					addonId: addon.addonId.trim(),
					priceOverride:
						addon.priceOverride !== undefined && addon.priceOverride !== null
							? addon.priceOverride
							: null,
					displayOrder: addon.displayOrder ?? index,
				});
			});
		}

		const variantsToCreate: MenuItemVariant[] = [];
		if (input.variants && input.variants.length > 0) {
			const defaultCount = input.variants.filter((v) => v.isDefault).length;
			if (defaultCount > 1) {
				throw new InvalidVariantDataError(messages.MULTIPLE_DEFAULT_VARIANTS);
			}

			input.variants.forEach((v, index) => {
				const isDefault =
					defaultCount === 0 ? index === 0 : (v.isDefault ?? false);
				variantsToCreate.push(
					MenuItemVariant.create({
						sku: v.sku,
						name: v.name,
						price: v.price,
						isDefault,
					}),
				);
			});
		}

		const imagesToCreate = (input.images || []).map((img, index) => ({
			objectKey: img.objectKey.trim(),
			displayOrder: img.displayOrder ?? index,
		}));

		const menuItem = MenuItem.create({
			restaurantId: input.restaurantId,
			categoryId: input.categoryId,
			name: trimmedName,
			description: input.description,
			price: input.price,
			preparationTime: input.preparationTime,
			calories: input.calories,
			isVegetarian: input.isVegetarian,
			isFeatured: input.isFeatured,
			isAvailable: input.isAvailable,
		});

		const aggregate = await this.menuItemRepository.createWithDetails({
			menuItem,
			images: imagesToCreate,
			variants: variantsToCreate,
			addons: preparedAddons,
		});

		return {
			id: aggregate.item.id,
			restaurantId: aggregate.item.restaurantId,
			categoryId: aggregate.item.categoryId,
			name: aggregate.item.name,
			description: aggregate.item.description,
			price: aggregate.item.price,
			preparationTime: aggregate.item.preparationTime,
			calories: aggregate.item.calories,
			isVegetarian: aggregate.item.isVegetarian,
			isFeatured: aggregate.item.isFeatured,
			isAvailable: aggregate.item.isAvailable,
			images: aggregate.images.map((img) => ({
				id: img.id,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
			})),
			variants: aggregate.variants.map((v) => ({
				id: v.id,
				sku: v.sku,
				name: v.name,
				price: v.price,
				isDefault: v.isDefault,
			})),
			addons: aggregate.addons.map((a) => ({
				id: a.id,
				addonId: a.addonId,
				name: a.name,
				price: a.price,
				priceOverride: a.priceOverride,
				displayOrder: a.displayOrder,
			})),
			createdAt: aggregate.item.createdAt.toISOString(),
			updatedAt: aggregate.item.updatedAt.toISOString(),
		};
	}
}
