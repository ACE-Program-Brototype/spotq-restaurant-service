import type { StaffDetailResponseDTO } from "@/application/dtos/staff/staff-detail-response.dto.ts";
import type { StaffProfileResponseDTO } from "@/application/dtos/staff/staff-profile-response.dto.ts";
import type { StaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import type { UpdateStaffInfoResponseDTO } from "@/application/dtos/staff/update-staff-info.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";

export const StaffMapper = {
	toDTO(
		entity: RestaurantStaff,
		avatarUrl?: string | null,
	): StaffResponseDTO {
		const finalAvatarUrl =
			avatarUrl !== undefined ? avatarUrl : (entity.avatarUrl ?? null);
		return {
			id: entity.staffId || entity.id,
			restaurantId: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatarUrl: finalAvatarUrl,
			avatar_url: finalAvatarUrl,
			role: entity.role,
			status: entity.status,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	},

	toProfileDTO(
		entity: RestaurantStaff,
		avatarUrl?: string | null,
	): StaffProfileResponseDTO {
		const finalAvatarUrl =
			avatarUrl !== undefined ? avatarUrl : (entity.avatarUrl ?? null);
		return {
			id: entity.staffId || entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatar_url: finalAvatarUrl,
			role: entity.role,
			status: entity.status,
			created_at: entity.createdAt.toISOString(),
		};
	},

	toItemDTO(entity: RestaurantStaff) {
		return {
			id: entity.staffId || entity.id,
			fullname: entity.fullname,
			email: entity.email,
			status: entity.status,
		};
	},

	toUpdateProfileDTO(
		entity: RestaurantStaff,
		avatarUrl?: string | null,
	): UpdateStaffProfileResponseDTO {
		const finalAvatarUrl =
			avatarUrl !== undefined ? avatarUrl : (entity.avatarUrl ?? null);
		return {
			id: entity.staffId || entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatar_url: finalAvatarUrl,
			role: entity.role,
			status: entity.status,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
		};
	},

	toUpdateStaffInfoDTO(
		entity: RestaurantStaff,
		avatarUrl?: string | null,
	): UpdateStaffInfoResponseDTO {
		const finalAvatarUrl =
			avatarUrl !== undefined ? avatarUrl : (entity.avatarUrl ?? null);
		return {
			id: entity.staffId || entity.id,
			restaurant_id: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			role: entity.role,
			status: entity.status,
			avatar_url: finalAvatarUrl,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
		};
	},

	toDetailDTO(
		entity: RestaurantStaff,
		avatarUrl?: string | null,
	): StaffDetailResponseDTO {
		const finalAvatarUrl =
			avatarUrl !== undefined ? avatarUrl : (entity.avatarUrl ?? null);
		return {
			id: entity.staffId || entity.id,
			restaurantId: entity.restaurantId,
			fullname: entity.fullname,
			email: entity.email,
			phone: entity.phone,
			avatarUrl: finalAvatarUrl,
			role: entity.role,
			status: entity.status,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		};
	},
};
