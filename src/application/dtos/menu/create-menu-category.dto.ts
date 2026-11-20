export interface CreateMenuCategoryInputDto {
	restaurantId: string;
	name: string;
	description?: string | null;
	displayOrder?: number;
}

export interface MenuCategoryResponseDto {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	displayOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
