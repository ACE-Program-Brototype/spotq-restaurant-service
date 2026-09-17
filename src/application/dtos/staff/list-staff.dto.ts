import type { StaffStatus } from "@/domain/value-objects/staff-status.vo.ts";
import type { PaginationMetadata } from "./list-invitations.dto.ts";

export interface ListStaffMembersDTO {
	restaurantId: string;
	ownerEmail?: string;
	page?: number;
	limit?: number;
	status?: StaffStatus;
	search?: string;
	sortBy?: "createdAt";
	sortOrder?: "ASC" | "DESC" | "asc" | "desc";
}

export interface StaffMemberItemDTO {
	id: string;
	fullname: string;
	email: string;
	status: StaffStatus;
}

export interface PaginatedStaffMembersResponseDTO {
	staff: StaffMemberItemDTO[];
	pagination: PaginationMetadata;
}
