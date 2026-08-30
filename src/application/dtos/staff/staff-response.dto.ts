export interface StaffResponseDTO {
	id: string;
	restaurantId: string;
	fullname: string;
	email: string;
	phone: string;
	avatarUrl: string | null;
	role: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginStaffResponseDTO {
	staff: StaffResponseDTO;
	accessToken: string;
	refreshToken: string;
}
