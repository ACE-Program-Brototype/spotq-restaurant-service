import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import type { Addon } from "@/domain/entities/addon.entity.ts";

export const AddonMapper = {
	toResponseDto(entity: Addon): AddonResponseDto {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			name: entity.name,
			description: entity.description,
			price: entity.price,
			imageKey: entity.imageKey,
			isAvailable: entity.isAvailable,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	},
};
