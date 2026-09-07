import type {
	AcceptInvitationDTO,
	AcceptInvitationResponseDTO,
} from "@/application/dtos/staff/accept-invitation.dto.ts";

export interface IAcceptInvitationUseCase {
	execute(dto: AcceptInvitationDTO): Promise<AcceptInvitationResponseDTO>;
}
