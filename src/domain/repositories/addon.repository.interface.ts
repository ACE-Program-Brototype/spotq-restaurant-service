import type { Addon } from "@/domain/entities/addon.entity.ts";

export interface IAddonRepository {
	create(addon: Addon): Promise<Addon>;
	findById(id: string): Promise<Addon | null>;
	findByNameAndRestaurantId(
		name: string,
		restaurantId: string,
	): Promise<Addon | null>;
	findByRestaurantId(restaurantId: string): Promise<Addon[]>;
}
