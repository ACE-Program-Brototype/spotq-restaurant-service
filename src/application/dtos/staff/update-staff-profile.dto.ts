export interface UpdateStaffProfileDTO {
	restaurantId: string;
	staffId: string;
	name?: string;
	fullname?: string;
	phone?: string;
	avatarUpdatedAt?: Date | null;
	hasAvatar?: boolean | null;
	avatar_url?: string | null;
	avatarUrl?: string | null;
}
