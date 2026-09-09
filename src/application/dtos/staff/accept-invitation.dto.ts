import type { StaffResponseDTO } from "./staff-response.dto.ts";

export interface AcceptInvitationDTO {
	token: string;
	fullname: string;
	phone: string;
	password: string;
}

export interface AcceptInvitationResponseDTO {
	staff: StaffResponseDTO;
	accessToken: string;
	refreshToken: string;
}
