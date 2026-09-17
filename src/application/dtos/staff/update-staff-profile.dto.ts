export interface UpdateStaffProfileDTO {
	restaurantId: string;
	staffId: string;
	name?: string;
	fullname?: string;
	phone?: string;
	avatar_url?: string | null;
	avatarUrl?: string | null;
}
