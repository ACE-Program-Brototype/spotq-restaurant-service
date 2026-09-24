export interface ListMenuCategoriesInputDto {
	restaurantId: string;
}

export interface MenuCategoryItemDto {
	id: string;
	name: string;
	description: string | null;
	isActive: boolean;
	displayOrder: number;
}

export interface ListMenuCategoriesResponseDto {
	restaurantId: string;
	categories: MenuCategoryItemDto[];
}
