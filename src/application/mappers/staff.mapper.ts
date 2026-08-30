import type { StaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";

export const StaffMapper = {
	toDTO(entity: RestaurantStaff): StaffResponseDTO {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatarUrl: entity.avatarUrl,
			role: entity.role,
			status: entity.status,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	},
};
