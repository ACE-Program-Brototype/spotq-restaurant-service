import type {
	ValidateInvitationDTO,
	ValidateInvitationResponseDTO,
} from "@/application/dtos/staff/validate-invitation.dto.ts";

export interface IValidateInvitationUseCase {
	execute(dto: ValidateInvitationDTO): Promise<ValidateInvitationResponseDTO>;
}
