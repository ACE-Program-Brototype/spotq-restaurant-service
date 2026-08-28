import type { RestaurantStaff as PrismaRestaurantStaff } from "@prisma/client";
import type { StaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";

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

	toDomain(raw: PrismaRestaurantStaff): RestaurantStaff {
		return RestaurantStaff.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			fullname: raw.fullname,
			email: raw.email,
			phone: raw.phone,
			avatarUrl: raw.avatarUrl,
			passwordHash: raw.passwordHash,
			role: raw.role,
			status: raw.status,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},
};
