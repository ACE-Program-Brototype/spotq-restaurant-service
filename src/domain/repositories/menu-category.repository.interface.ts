import type { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IMenuCategoryRepository
	extends IBaseRepository<MenuCategory, string> {
	findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
	): Promise<MenuCategory | null>;
	getNextDisplayOrder(restaurantId: string): Promise<number>;
	create(category: MenuCategory): Promise<MenuCategory>;
}
