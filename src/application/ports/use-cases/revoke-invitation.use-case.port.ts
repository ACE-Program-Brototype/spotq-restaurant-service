import type {
	RevokeInvitationDTO,
	RevokeInvitationResponseDTO,
} from "@/application/dtos/staff/revoke-invitation.dto.ts";

export interface IRevokeStaffInvitationUseCase {
	execute(dto: RevokeInvitationDTO): Promise<RevokeInvitationResponseDTO>;
}
