export interface UpdateMenuCategoryInputDto {
	restaurantId: string;
	categoryId: string;
	name?: string;
	description?: string | null;
	displayOrder?: number;
	isActive?: boolean;
}
