/**
 * Data Transfer Object for removing a staff member.
 * Scoped by both restaurantId and staffId to ensure strict multi-tenant boundary.
 */
export interface RemoveStaffDTO {
	restaurantId: string;
	staffId: string;
}
