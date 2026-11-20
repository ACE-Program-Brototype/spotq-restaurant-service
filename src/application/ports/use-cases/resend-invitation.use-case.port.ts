import type {
	ResendInvitationDTO,
	ResendInvitationResponseDTO,
} from "@/application/dtos/staff/resend-invitation.dto.ts";

export interface IResendStaffInvitationUseCase {
	execute(dto: ResendInvitationDTO): Promise<ResendInvitationResponseDTO>;
}
