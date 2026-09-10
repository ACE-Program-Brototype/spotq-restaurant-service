import type { StaffInvitation as PrismaStaffInvitation } from "@prisma/client";
import { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";

export const StaffInvitationPersistenceMapper = {
	toDomain(raw: PrismaStaffInvitation): StaffInvitation {
		return StaffInvitation.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			email: raw.email,
			tokenHash: raw.tokenHash,
			status: raw.status,
			expiresAt: raw.expiresAt,
			acceptedAt: raw.acceptedAt,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: StaffInvitation): PrismaStaffInvitation {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			email: entity.email,
			tokenHash: entity.tokenHash,
			status: entity.status,
			expiresAt: entity.expiresAt,
			acceptedAt: entity.acceptedAt,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
