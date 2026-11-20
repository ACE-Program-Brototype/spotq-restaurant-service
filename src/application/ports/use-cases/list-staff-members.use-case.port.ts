import type {
	ListStaffMembersDTO,
	PaginatedStaffMembersResponseDTO,
} from "@/application/dtos/staff/list-staff.dto.ts";

export interface IListStaffMembersUseCase {
	execute(dto: ListStaffMembersDTO): Promise<PaginatedStaffMembersResponseDTO>;
}
