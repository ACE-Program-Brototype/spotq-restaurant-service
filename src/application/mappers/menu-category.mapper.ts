import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { MenuCategory } from "@/domain/entities/menu-category.entity.ts";

export const MenuCategoryMapper = {
	toResponseDto(entity: MenuCategory): MenuCategoryResponseDto {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			name: entity.name,
			description: entity.description,
			displayOrder: entity.displayOrder,
			isActive: entity.isActive,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	},
};
