import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import type { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";

export interface MenuItemImageData {
	id: string;
	menuItemId: string;
	objectKey: string;
	displayOrder: number;
	createdAt: Date;
}

export interface MenuItemAddonLinkData {
	id: string;
	menuItemId: string;
	addonId: string;
	name: string;
	price: number;
	priceOverride: number | null;
	displayOrder: number;
}

export interface MenuItemAggregate {
	item: MenuItem;
	images: MenuItemImageData[];
	variants: MenuItemVariant[];
	addons: MenuItemAddonLinkData[];
}

export interface CreateMenuItemRepositoryParams {
	menuItem: MenuItem;
	images: Array<{ objectKey: string; displayOrder: number }>;
	variants: MenuItemVariant[];
	addons: Array<{
		addonId: string;
		priceOverride: number | null;
		displayOrder: number;
	}>;
}

export interface IMenuItemRepository {
	createWithDetails(
		params: CreateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate>;
	findById(id: string): Promise<MenuItem | null>;
	findByNameAndRestaurantId(
		name: string,
		restaurantId: string,
	): Promise<MenuItem | null>;
	verifyCategoryBelongsToRestaurant(
		categoryId: string,
		restaurantId: string,
	): Promise<boolean>;
	verifyAddonsBelongToRestaurant(
		addonIds: string[],
		restaurantId: string,
	): Promise<boolean>;
}
