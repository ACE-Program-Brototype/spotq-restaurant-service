import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { StaffStatus } from "@/domain/value-objects/staff-status.vo.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface StaffFilterParams {
	restaurantId: string;
	page: number;
	limit: number;
	status?: StaffStatus;
	search?: string;
	sortBy: "createdAt";
	sortOrder: "asc" | "desc";
}

export interface ActiveMembershipInfo {
	membership: RestaurantStaff;
	restaurantId: string;
	restaurantName: string;
	role: string;
	status?: string;
}

export interface IRestaurantStaffRepository
	extends IBaseRepository<RestaurantStaff, string> {
	findByEmail(email: string): Promise<RestaurantStaff | null>;
	findByEmailAndRestaurantId(
		email: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;
	findByStaffIdAndRestaurantId(
		staffId: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;
	findActiveByStaffId(staffId: string): Promise<ActiveMembershipInfo[]>;
	findByRestaurantId(restaurantId: string): Promise<RestaurantStaff[]>;
	findManyWithFilters(
		params: StaffFilterParams,
	): Promise<{ staff: RestaurantStaff[]; total: number }>;
	findByIdAndRestaurantId(
		id: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;
	removeStaff(id: string, restaurantId: string): Promise<void>;
	updateStaffInfo(
		id: string,
		data: { fullname?: string; phone?: string; avatarUrl?: string | null },
	): Promise<RestaurantStaff>;
	updateStatus?(
		id: string,
		status: "ACTIVE" | "INACTIVE",
		restaurantId?: string,
	): Promise<RestaurantStaff>;
}
