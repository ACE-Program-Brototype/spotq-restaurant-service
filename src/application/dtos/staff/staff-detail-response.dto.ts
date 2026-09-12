export interface StaffDetailResponseDTO {
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
