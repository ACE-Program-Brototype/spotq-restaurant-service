export interface UpdateMenuItemVariantStatusInputDto {
	id: string;
	restaurantId: string;
	menuItemId: string;
	userId?: string;
	userRole?: string;
}

export interface UpdateMenuItemVariantStatusOutputDto {
	id: string;
	menuItemId: string;
	restaurantId: string;
	name: string;
	sku: string | null;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
	updatedAt: Date;
}
