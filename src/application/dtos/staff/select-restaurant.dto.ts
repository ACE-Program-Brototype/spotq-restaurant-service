import type { StaffResponseDTO } from "./staff-response.dto.ts";

export interface SelectRestaurantDTO {
	selectToken: string;
	restaurantId: string;
}

export interface SelectRestaurantResponseDTO {
	staff: StaffResponseDTO;
	accessToken: string;
	refreshToken: string;
}
