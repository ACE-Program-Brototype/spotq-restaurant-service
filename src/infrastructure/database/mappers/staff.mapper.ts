/**
 * Staff Persistence Mappers.
 *
 * Implements two-way mapping between raw Prisma records and domain entities:
 * 1. StaffGlobalPersistenceMapper: Maps raw Staff records to/from global Staff domain entity.
 * 2. StaffPersistenceMapper: Maps raw RestaurantStaff records (with relational joins) to/from RestaurantStaff domain entity.
 */
import type {
	RestaurantStaff as PrismaRestaurantStaff,
	Staff as PrismaStaff,
} from "@prisma/client";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { Staff } from "@/domain/entities/staff.entity.ts";

type RawPrismaStaff = PrismaStaff & {
	avatarUrl?: string | null;
	avatarUpdatedAt?: Date | null;
};

export type PrismaRestaurantStaffWithRelations = PrismaRestaurantStaff & {
	staff?: PrismaStaff | null;
	fullname?: string;
	email?: string;
	phone?: string;
	passwordHash?: string;
	avatarUrl?: string | null;
	avatarUpdatedAt?: Date | null;
};

export const StaffGlobalPersistenceMapper = {
	toDomain(raw: PrismaStaff): Staff {
		const record = raw as RawPrismaStaff;
		return Staff.reconstitute({
			id: record.id,
			email: record.email,
			fullname: record.fullname,
			phone: record.phone,
			passwordHash: record.passwordHash,
			avatarUrl: record.avatarUrl ?? null,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});
	},

	toPersistence(entity: Staff): PrismaStaff {
		return {
			id: entity.id,
			email: entity.email,
			fullname: entity.fullname,
			phone: entity.phone,
			passwordHash: entity.passwordHash,
			avatarUrl: entity.avatarUrl,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		} as unknown as PrismaStaff;
	},
};

export const StaffPersistenceMapper = {
	toDomain(raw: PrismaRestaurantStaffWithRelations): RestaurantStaff {
		const rawStaff = raw.staff as RawPrismaStaff | null | undefined;
		const staffEntity = rawStaff
			? StaffGlobalPersistenceMapper.toDomain(rawStaff as PrismaStaff)
			: undefined;

		const email = rawStaff?.email || raw.email || "";
		const fullname = rawStaff?.fullname || raw.fullname || "";
		const phone = rawStaff?.phone || raw.phone || "";
		const passwordHash = rawStaff?.passwordHash || raw.passwordHash || "";
		const avatarUrl =
			rawStaff?.avatarUrl !== undefined
				? rawStaff.avatarUrl
				: (raw.avatarUrl ?? null);

		return RestaurantStaff.reconstitute({
			id: raw.id,
			staffId: raw.staffId || raw.id,
			restaurantId: raw.restaurantId,
			role: raw.role,
			status: raw.status,
			joinedAt: raw.joinedAt,
			leftAt: raw.leftAt,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			staff: staffEntity,
			email,
			fullname,
			phone,
			passwordHash,
			avatarUrl,
			avatarUpdatedAt: rawStaff?.avatarUpdatedAt ?? raw.avatarUpdatedAt,
		});
	},

	toPersistence(entity: RestaurantStaff): PrismaRestaurantStaff {
		return {
			id: entity.id,
			staffId: entity.staffId || entity.id,
			restaurantId: entity.restaurantId,
			role: entity.role,
			status: entity.status,
			joinedAt: entity.joinedAt ?? new Date(),
			leftAt: entity.leftAt,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		} as unknown as PrismaRestaurantStaff;
	},
};
