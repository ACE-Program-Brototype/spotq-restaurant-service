export interface CreateAddonInputDto {
	restaurantId: string;
	name: string;
	description?: string | null;
	price: number;
	imageKey?: string | null;
	isAvailable?: boolean;
}

export interface AddonResponseDto {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	price: number;
	imageKey: string | null;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}
