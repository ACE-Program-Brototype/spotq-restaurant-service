import type { StaffProfileResponseDTO } from "./staff-profile-response.dto.ts";

/**
 * Data transfer object for updating a staff member's operational status.
 */
export interface UpdateStaffStatusDTO {
	restaurantId: string;
	staffId: string;
	status: "ACTIVE" | "INACTIVE";
}

/**
 * Reuses the canonical StaffProfileResponseDTO to avoid duplicate DTO definitions.
 */
export type UpdateStaffStatusResponseDTO = StaffProfileResponseDTO;
