export interface ValidateInvitationDTO {
	token: string;
}

export interface ValidateInvitationResponseDTO {
	valid: boolean;
	email: string;
	restaurantName: string;
}
