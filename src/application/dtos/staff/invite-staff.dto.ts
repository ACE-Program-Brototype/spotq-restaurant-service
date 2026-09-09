export interface InviteStaffDTO {
	email: string;
	restaurantId: string;
}

export interface StaffInvitationResponseDTO {
	id: string;
	email: string;
	restaurantId: string;
	status: string;
	expiresAt: Date;
	createdAt: Date;
}
