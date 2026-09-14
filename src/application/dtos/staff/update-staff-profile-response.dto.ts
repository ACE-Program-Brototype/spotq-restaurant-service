export interface UpdateStaffProfileResponseDTO {
	id: string;
	restaurant_id: string;
	fullname: string;
	email: string;
	phone: string;
	avatar_url: string | null;
	role: string;
	status: string;
	created_at: string;
	updated_at: string;
}
