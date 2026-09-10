import type {
	InviteStaffDTO,
	StaffInvitationResponseDTO,
} from "@/application/dtos/staff/invite-staff.dto.ts";

export interface IInviteStaffUseCase {
	execute(dto: InviteStaffDTO): Promise<StaffInvitationResponseDTO>;
}
