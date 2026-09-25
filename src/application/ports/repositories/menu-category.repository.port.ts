import type { MenuCategory } from "@/domain/entities/menu-category.entity.ts";

export interface IMenuCategoryRepositoryPort {
	findById(id: string): Promise<MenuCategory | null>;
	findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
	): Promise<MenuCategory | null>;
	getNextDisplayOrder(restaurantId: string): Promise<number>;
	create(category: MenuCategory): Promise<MenuCategory>;
}
