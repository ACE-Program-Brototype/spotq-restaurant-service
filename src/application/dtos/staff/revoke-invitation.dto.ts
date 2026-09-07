export interface RevokeInvitationDTO {
	restaurantId: string;
	invitationId?: string;
	email?: string;
}

export interface RevokeInvitationResponseDTO {
	revoked: boolean;
	invitationId: string;
}
