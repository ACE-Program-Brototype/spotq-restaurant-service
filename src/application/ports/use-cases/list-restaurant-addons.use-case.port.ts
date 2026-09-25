import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";

export interface IListRestaurantAddonsUseCase {
	execute(restaurantId: string): Promise<AddonResponseDto[]>;
}
