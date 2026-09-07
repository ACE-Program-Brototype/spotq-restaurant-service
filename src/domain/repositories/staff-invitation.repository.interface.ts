import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IStaffInvitationRepository
	extends IBaseRepository<StaffInvitation, string> {
	findByTokenHash(tokenHash: string): Promise<StaffInvitation | null>;
	findByEmail(email: string): Promise<StaffInvitation[]>;
	findPendingByEmailAndRestaurant(
		email: string,
		restaurantId: string,
	): Promise<StaffInvitation | null>;
	findByRestaurantId(restaurantId: string): Promise<StaffInvitation[]>;
	createStaffWithInvitation(
		staff: RestaurantStaff,
		invitation: StaffInvitation,
	): Promise<void>;
}
