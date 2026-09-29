export interface UpdateAddonInputDto {
	restaurantId: string;
	addonId: string;
	name?: string;
	description?: string | null;
	price?: number;
	imageKey?: string | null;
	isAvailable?: boolean;
}
