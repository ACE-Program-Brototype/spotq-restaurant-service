import type { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { CreateRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/config/di/types";
import { Restaurant } from "@/domain/entities/restaurant.entity";
import { ONBOARDING_STATUS } from "@/domain/value-objects/onboarding-status.vo.ts";
import { RESTAURANT_STATUS } from "@/domain/value-objects/restaurant-status.vo.ts";
import { RestaurantPersistenceMapper } from "@/infrastructure/database/mappers/restaurant.mapper";

@injectable()
export class RestaurantRepository implements IRestaurantRepository {
	constructor(
		@inject(TYPES.Database.PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	async create(data: Partial<Restaurant>): Promise<Restaurant> {
		const domainEntity = Restaurant.create({
			restaurantName: data.restaurantName ?? "",
			email: data.email ?? "",
			phone: data.phone ?? "",
			ownerName: data.ownerName ?? "",
			ownerEmail: data.ownerEmail ?? "",
			emailVerifiedAt: data.emailVerifiedAt,
		});

		const raw = await this.prisma.restaurant.create({
			data: RestaurantPersistenceMapper.toPersistence(domainEntity),
		});

		return RestaurantPersistenceMapper.toDomain(raw);
	}

	async createRestaurant(data: CreateRestaurantDto): Promise<Restaurant> {
		const domainEntity = Restaurant.create({
			restaurantName: data.restaurantName,
			email: data.email,
			phone: data.phone,
			ownerName: data.ownerName,
			ownerEmail: data.ownerEmail,
			emailVerifiedAt: data.emailVerifiedAt,
		});

		const raw = await this.prisma.restaurant.create({
			data: RestaurantPersistenceMapper.toPersistence(domainEntity),
		});

		return RestaurantPersistenceMapper.toDomain(raw);
	}

	async findById(id: string): Promise<Restaurant | null> {
		const raw = await this.prisma.restaurant.findUnique({
			where: { id },
		});

		return raw ? RestaurantPersistenceMapper.toDomain(raw) : null;
	}

	async findCompletedDetailsById(
		id: string,
	): Promise<RestaurantDetailsResponseDto | null> {
		const raw = await this.prisma.restaurant.findFirst({
			where: {
				id,
				onboardingStatus: ONBOARDING_STATUS.COMPLETED,
				status: {
					not: RESTAURANT_STATUS.PENDING,
				},
			},
			include: {
				address: true,
				profile: true,
				settings: true,
				operatingHours: true,
				documents: true,
				images: {
					orderBy: {
						displayOrder: "asc",
					},
				},
				staff: {
					select: {
						id: true,
						fullname: true,
						email: true,
						phone: true,
						role: true,
						status: true,
						avatarUrl: true,
						createdAt: true,
					},
				},
			},
		});

		if (!raw) {
			return null;
		}

		return {
			id: raw.id,
			restaurantName: raw.restaurantName,
			category: raw.settings?.cuisineType ?? null,
			email: raw.email,
			phone: raw.phone,
			ownerName: raw.ownerName,
			ownerEmail: raw.ownerEmail,
			status: raw.status,
			onboardingStatus: raw.onboardingStatus,
			isBlocked: raw.isBlocked,
			blockReason: raw.blockReason,
			isSubscriptionActive: raw.isSubscriptionActive,
			subscriptionPlanCode: raw.subscriptionPlanCode,
			subscriptionEndsAt: raw.subscriptionEndsAt,
			lastLoginAt: raw.lastLoginAt,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			address: raw.address
				? {
						id: raw.address.id,
						addressLine1: raw.address.addressLine1,
						addressLine2: raw.address.addressLine2,
						city: raw.address.city,
						state: raw.address.state,
						country: raw.address.country,
						pincode: raw.address.pincode,
						latitude: Number(raw.address.latitude),
						longitude: Number(raw.address.longitude),
					}
				: null,
			settings: raw.settings
				? {
						isOpened: raw.settings.isOpened,
						isPreorder: raw.settings.isPreorder,
						isLoyaltyEnabled: raw.settings.isLoyaltyEnabled,
						cuisineType: raw.settings.cuisineType,
						seatingCapacity: raw.settings.seatingCapacity,
						openTime: raw.settings.openTime,
						closeTime: raw.settings.closeTime,
					}
				: null,
			profile: raw.profile
				? {
						coverImage: raw.profile.coverImage,
						avatar: raw.profile.avatar,
						description: raw.profile.description,
						fssaiNumber: raw.profile.fssaiNumber,
						registerNumber: raw.profile.registerNumber,
						gstNumber: raw.profile.gstNumber,
					}
				: null,
			operatingHours: (raw.operatingHours || []).map((oh) => ({
				id: oh.id,
				dayOfWeek: oh.dayOfWeek,
				isOpen: oh.isOpen,
				openTime: oh.openTime,
				closeTime: oh.closeTime,
			})),
			staff: (raw.staff || []).map((s) => ({
				id: s.id,
				fullname: s.fullname,
				email: s.email,
				phone: s.phone,
				role: s.role,
				status: s.status,
				avatarUrl: s.avatarUrl,
				createdAt: s.createdAt,
			})),
			documents: (raw.documents || []).map((doc) => ({
				id: doc.id,
				documentType: doc.documentType,
				documentName: doc.documentName,
				documentKey: doc.documentKey,
				verificationStatus: doc.verificationStatus,
				uploadedAt: doc.uploadedAt,
			})),
			images: (raw.images || []).map((img) => ({
				id: img.id,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
				createdAt: img.createdAt,
			})),
			linkedAccount: {
				email: raw.ownerEmail,
				phone: raw.phone,
				isEmailVerified: Boolean(raw.emailVerifiedAt),
				lastLoginAt: raw.lastLoginAt,
			},
		};
	}

	async findUnique(where: Record<string, unknown>): Promise<Restaurant | null> {
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic query support
		const raw = await (this.prisma.restaurant as any).findUnique({
			where,
		});

		return raw ? RestaurantPersistenceMapper.toDomain(raw) : null;
	}

	async find(): Promise<Restaurant[]> {
		const rawList = await this.prisma.restaurant.findMany();
		return rawList.map((raw) => RestaurantPersistenceMapper.toDomain(raw));
	}

	async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
		const updateData: Prisma.RestaurantUpdateInput = {};
		if (data.restaurantName !== undefined) updateData.restaurantName = data.restaurantName;
		if (data.email !== undefined) updateData.email = data.email;
		if (data.phone !== undefined) updateData.phone = data.phone;
		if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
		if (data.ownerEmail !== undefined) updateData.ownerEmail = data.ownerEmail;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.onboardingStatus !== undefined) updateData.onboardingStatus = data.onboardingStatus;
		if (data.emailVerifiedAt !== undefined) updateData.emailVerifiedAt = data.emailVerifiedAt;
		if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked;
		if (data.blockReason !== undefined) updateData.blockReason = data.blockReason;

		const raw = await this.prisma.restaurant.update({
			where: { id },
			data: updateData,
		});

		return RestaurantPersistenceMapper.toDomain(raw);
	}

	async existsByEmail(email: string): Promise<boolean> {
		const count = await this.prisma.restaurant.count({
			where: { email },
		});

		return count > 0;
	}

	async findByEmail(email: string): Promise<Restaurant | null> {
		const raw = await this.prisma.restaurant.findUnique({
			where: { email },
		});

		return raw ? RestaurantPersistenceMapper.toDomain(raw) : null;
	}

	async save(restaurant: Restaurant): Promise<void> {
		const rawData = RestaurantPersistenceMapper.toPersistence(restaurant);
		const { id, createdAt, ...updateData } = rawData;

		await this.prisma.restaurant.upsert({
			where: { id: restaurant.id },
			create: rawData,
			update: updateData,
		});
	}

	async updateLastLogin(id: string, date: Date = new Date()): Promise<void> {
		await this.prisma.restaurant.update({
			where: { id },
			data: { lastLoginAt: date },
		});
	}
}

