import type { StaffDetailResponseDTO } from "@/application/dtos/staff/staff-detail-response.dto.ts";
import type { StaffProfileResponseDTO } from "@/application/dtos/staff/staff-profile-response.dto.ts";
import type { StaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import type { UpdateStaffInfoResponseDTO } from "@/application/dtos/staff/update-staff-info.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
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

	toProfileDTO(entity: RestaurantStaff): StaffProfileResponseDTO {
		return {
			id: entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatar_url: entity.avatarUrl,
			role: entity.role,
			status: entity.status,
			created_at: entity.createdAt.toISOString(),
		};
	},

	toItemDTO(entity: RestaurantStaff) {
		return {
			id: entity.id,
			fullname: entity.fullname,
			email: entity.email,
			status: entity.status,
		};
	},

	toUpdateProfileDTO(entity: RestaurantStaff): UpdateStaffProfileResponseDTO {
		return {
			id: entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatar_url: entity.avatarUrl,
			role: entity.role,
			status: entity.status,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
		};
	},

	toUpdateStaffInfoDTO(entity: RestaurantStaff): UpdateStaffInfoResponseDTO {
		return {
			id: entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			role: entity.role,
			status: entity.status,
			avatar_url: entity.avatarUrl,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
		};
	},

	toDetailDTO(entity: RestaurantStaff): StaffDetailResponseDTO {
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
