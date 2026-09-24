export interface StaffResponseDTO {
	id: string;
	restaurantId: string;
	fullname: string;
	email: string;
	phone: string;
	avatarUrl: string | null;
	avatar_url?: string | null;
	role: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface RestaurantOptionDTO {
	id: string;
	name: string;
	role: string;
	restaurantId?: string;
	restaurantName?: string;
	status?: string;
}

export interface LoginStaffResponseDTO {
	requiresRestaurantSelection?: boolean;
	selectToken?: string;
	restaurants?: RestaurantOptionDTO[];
	staff?: StaffResponseDTO;
	accessToken?: string;
	refreshToken?: string;
}
