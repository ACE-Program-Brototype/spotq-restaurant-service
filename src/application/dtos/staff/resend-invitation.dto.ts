import type { StaffInvitationResponseDTO } from "./invite-staff.dto.ts";

export interface ResendInvitationDTO {
	restaurantId: string;
	email: string;
}

export interface ResendInvitationResponseDTO
	extends StaffInvitationResponseDTO {}
