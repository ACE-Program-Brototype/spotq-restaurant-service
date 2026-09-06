import type { Restaurant as PrismaRestaurant } from "@prisma/client";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";

type RawPrismaRestaurant = PrismaRestaurant & {
	onboardingStatus?: string;
};

export const RestaurantPersistenceMapper = {
	toDomain(raw: PrismaRestaurant): Restaurant {
		const record = raw as RawPrismaRestaurant;
		return Restaurant.reconstitute({
			id: record.id,
			restaurantName: record.restaurantName,
			email: record.email,
			phone: record.phone,
			ownerName: record.ownerName,
			ownerEmail: record.ownerEmail,
			status: record.status,
			onboardingStatus: record.onboardingStatus ?? "PENDING",
			emailVerifiedAt: record.emailVerifiedAt ?? null,
			isBlocked: record.isBlocked ?? false,
			blockReason: record.blockReason ?? null,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		});
	},

	toPersistence(entity: Restaurant): PrismaRestaurant {
		return {
			id: entity.id,
			restaurantName: entity.restaurantName,
			email: entity.email,
			phone: entity.phone,
			ownerName: entity.ownerName,
			ownerEmail: entity.ownerEmail,
			status: entity.status,
			onboardingStatus: entity.onboardingStatus,
			emailVerifiedAt: entity.emailVerifiedAt,
			isBlocked: entity.isBlocked,
			blockReason: entity.blockReason,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		} as unknown as PrismaRestaurant;
	},
};
