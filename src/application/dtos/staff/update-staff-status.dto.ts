/**
 * Data transfer object for updating a staff member's operational status.
 */
export interface UpdateStaffStatusDTO {
	restaurantId: string;
	staffId: string;
	status: "ACTIVE" | "INACTIVE";
}

export interface UpdateStaffStatusResponseDTO {
	id: string;
	restaurant_id: string;
	fullname: string;
	email: string;
	phone: string;
	avatar_url: string | null;
	role: string;
	status: string;
	created_at: string;
}
