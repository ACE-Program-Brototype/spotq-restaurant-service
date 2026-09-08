import type {
	ListStaffInvitationsDTO,
	PaginatedStaffInvitationsResponseDTO,
} from "@/application/dtos/staff/list-invitations.dto.ts";

export interface IListStaffInvitationsUseCase {
	execute(
		dto: ListStaffInvitationsDTO,
	): Promise<PaginatedStaffInvitationsResponseDTO>;
}
