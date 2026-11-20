export interface ListStaffInvitationsDTO {
	restaurantId: string;
	page?: number;
	limit?: number;
	status?: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
	search?: string;
	sortBy?: "createdAt" | "expiresAt" | "email" | "status";
	sortOrder?: "asc" | "desc";
}

export interface StaffInvitationItemDTO {
	id: string;
	restaurantId: string;
	email: string;
	status: string;
	expiresAt: Date;
	acceptedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginationMetadata {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedStaffInvitationsResponseDTO {
	invitations: StaffInvitationItemDTO[];
	pagination: PaginationMetadata;
}
