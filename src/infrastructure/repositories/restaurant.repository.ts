import {
	DocumentType,
	DocumentVerificationStatus,
	OnboardingStatus,
	type Prisma,
	type PrismaClient,
	RestaurantStatus,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type {
	CreateRestaurantDto,
	OnboardRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type {
	IRestaurantRepository,
	RestaurantFilterParams,
} from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/config/di/types";
import { Restaurant } from "@/domain/entities/restaurant.entity";
import { ONBOARDING_STATUS } from "@/domain/value-objects/onboarding-status.vo.ts";
import { RESTAURANT_STATUS } from "@/domain/value-objects/restaurant-status.vo.ts";
import { RestaurantPersistenceMapper } from "@/infrastructure/database/mappers/restaurant.mapper";

const DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
	fssai: DocumentType.FSSAI,
	businessRegistration: DocumentType.BUSINESS_REGISTRATION,
	ownerIdentity: DocumentType.OWNER_IDENTITY,
	gst: DocumentType.GST,
	businessPan: DocumentType.BUSINESS_PAN,
};

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

	async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
		const updateData: Prisma.RestaurantUpdateInput = {};

		if (data.restaurantName) updateData.restaurantName = data.restaurantName;
		if (data.email) updateData.email = data.email;
		if (data.phone) updateData.phone = data.phone;
		if (data.ownerName) updateData.ownerName = data.ownerName;
		if (data.ownerEmail) updateData.ownerEmail = data.ownerEmail;
		if (data.status) updateData.status = data.status as RestaurantStatus;
		if (data.onboardingStatus)
			updateData.onboardingStatus = data.onboardingStatus as OnboardingStatus;
		if (data.emailVerifiedAt !== undefined)
			updateData.emailVerifiedAt = data.emailVerifiedAt;
		if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked;
		if (data.blockReason !== undefined)
			updateData.blockReason = data.blockReason;

		const raw = await this.prisma.restaurant.update({
			where: { id },
			data: updateData,
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

	async findUnique(where: {
		id?: string;
		email?: string;
	}): Promise<Restaurant | null> {
		const raw = await this.prisma.restaurant.findFirst({
			where: {
				...(where.id && { id: where.id }),
				...(where.email && { email: where.email }),
			},
		});

		return raw ? RestaurantPersistenceMapper.toDomain(raw) : null;
	}

	async find(where?: { email?: string }): Promise<Restaurant[]> {
		const list = await this.prisma.restaurant.findMany({
			where: {
				...(where?.email && { email: where.email }),
			},
		});

		return list.map(RestaurantPersistenceMapper.toDomain);
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

	async completeOnboarding(
		restaurant: Restaurant,
		dto: OnboardRestaurantDto,
	): Promise<Restaurant> {
		return await this.prisma.$transaction(async (tx) => {
			const updatedRaw = await tx.restaurant.update({
				where: { id: restaurant.id },
				data: {
					restaurantName: restaurant.restaurantName,
					phone: restaurant.phone,
					ownerName: restaurant.ownerName,
					onboardingStatus: OnboardingStatus.COMPLETED,
					status: RestaurantStatus.PENDING,
				},
			});

			const firstImage = dto.restaurantImages?.[0]?.objectKey ?? null;

			await tx.restaurantProfile.upsert({
				where: { restaurantId: restaurant.id },
				create: {
					restaurantId: restaurant.id,
					coverImage: firstImage,
				},
				update: {
					...(firstImage ? { coverImage: firstImage } : {}),
				},
			});

			if (dto.seatingCapacity !== undefined) {
				await tx.restaurantSettings.upsert({
					where: { restaurantId: restaurant.id },
					create: {
						restaurantId: restaurant.id,
						seatingCapacity: dto.seatingCapacity,
					},
					update: {
						seatingCapacity: dto.seatingCapacity,
					},
				});
			}

			if (dto.location) {
				await tx.restaurantAddress.upsert({
					where: { restaurantId: restaurant.id },
					create: {
						restaurantId: restaurant.id,
						addressLine1: dto.location.addressLine1,
						addressLine2: dto.location.addressLine2 ?? null,
						city: dto.location.city,
						state: dto.location.state,
						country: dto.location.country,
						pincode: dto.location.pincode,
						latitude: dto.location.latitude,
						longitude: dto.location.longitude,
					},
					update: {
						addressLine1: dto.location.addressLine1,
						addressLine2: dto.location.addressLine2 ?? null,
						city: dto.location.city,
						state: dto.location.state,
						country: dto.location.country,
						pincode: dto.location.pincode,
						latitude: dto.location.latitude,
						longitude: dto.location.longitude,
					},
				});
			}

			if (dto.documents) {
				const docEntries: Array<{
					key: string;
					doc: { documentName: string; documentKey: string };
					docType: DocumentType;
				}> = [];

				for (const [key, doc] of Object.entries(dto.documents)) {
					const docType = DOCUMENT_TYPE_MAP[key];
					if (doc && docType) {
						docEntries.push({ key, doc, docType });
					}
				}

				for (const entry of docEntries) {
					const existing = await tx.restaurantDocument.findFirst({
						where: {
							restaurantId: restaurant.id,
							documentType: entry.docType,
						},
					});

					if (existing) {
						await tx.restaurantDocument.update({
							where: { id: existing.id },
							data: {
								documentName: entry.doc.documentName,
								documentKey: entry.doc.documentKey,
							},
						});
					} else {
						await tx.restaurantDocument.create({
							data: {
								restaurantId: restaurant.id,
								documentType: entry.docType,
								documentName: entry.doc.documentName,
								documentKey: entry.doc.documentKey,
								verificationStatus: DocumentVerificationStatus.PENDING,
							},
						});
					}
				}
			}

			if (dto.restaurantImages && dto.restaurantImages.length > 0) {
				for (const [index, img] of dto.restaurantImages.entries()) {
					const order = img.displayOrder ?? index + 1;

					const existing = await tx.restaurantImage.findFirst({
						where: {
							restaurantId: restaurant.id,
							objectKey: img.objectKey,
						},
					});

					if (existing) {
						await tx.restaurantImage.update({
							where: { id: existing.id },
							data: { displayOrder: order },
						});
					} else {
						await tx.restaurantImage.create({
							data: {
								restaurantId: restaurant.id,
								objectKey: img.objectKey,
								displayOrder: order,
							},
						});
					}
				}
			}

			return RestaurantPersistenceMapper.toDomain(updatedRaw);
		});
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

	async findManyWithFilters(
		params: RestaurantFilterParams,
	): Promise<{ restaurants: Restaurant[]; total: number }> {
		const {
			page,
			limit,
			search,
			status,
			plan,
			isSubscriptionActive,
			createdFrom,
			createdTo,
			sortBy,
			sortOrder,
		} = params;

		const where: Prisma.RestaurantWhereInput = {
			onboardingStatus: ONBOARDING_STATUS.COMPLETED,
			status:
				status && status !== RESTAURANT_STATUS.PENDING
					? status
					: { not: RESTAURANT_STATUS.PENDING },
			...(plan && { subscriptionPlanCode: plan }),
			...(isSubscriptionActive !== undefined && { isSubscriptionActive }),
			...((createdFrom || createdTo) && {
				createdAt: {
					...(createdFrom && { gte: createdFrom }),
					...(createdTo && { lte: createdTo }),
				},
			}),
			...(search && {
				OR: [
					{
						restaurantName: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						ownerName: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						email: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						ownerEmail: {
							contains: search,
							mode: "insensitive",
						},
					},
					{
						phone: {
							contains: search,
							mode: "insensitive",
						},
					},
				],
			}),
		};

		const skip = (page - 1) * limit;

		const [rawList, total] = await Promise.all([
			this.prisma.restaurant.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			this.prisma.restaurant.count({ where }),
		]);

		return {
			restaurants: rawList.map((raw) =>
				RestaurantPersistenceMapper.toDomain(raw),
			),
			total,
		};
	}

	async activateSubscription(
		restaurantId: string,
		planCode: string,
		currentPeriodEnd: Date,
		eventId: string,
	): Promise<boolean> {
		try {
			return await (
				this.prisma as unknown as {
					$transaction: (
						fn: (tx: {
							restaurant: {
								update: (args: {
									where: { id: string };
									data: Record<string, unknown>;
								}) => Promise<unknown>;
							};
							processedEvent: {
								findUnique: (args: {
									where: { id: string };
								}) => Promise<{ id: string } | null>;
								create: (args: {
									data: { id: string; eventType: string };
								}) => Promise<unknown>;
							};
						}) => Promise<boolean>,
					) => Promise<boolean>;
				}
			).$transaction(async (tx) => {
				const alreadyProcessed = await tx.processedEvent.findUnique({
					where: { id: eventId },
				});

				if (alreadyProcessed) {
					return false;
				}

				await tx.restaurant.update({
					where: { id: restaurantId },
					data: {
						isSubscriptionActive: true,
						subscriptionPlanCode: planCode,
						subscriptionEndsAt: currentPeriodEnd,
						status: "ACTIVE",
					},
				});

				await tx.processedEvent.create({
					data: {
						id: eventId,
						eventType: "subscription.activated",
					},
				});

				return true;
			});
		} catch (error: unknown) {
			if (
				(error instanceof PrismaClientKnownRequestError &&
					error.code === "P2002") ||
				(error as { code?: string })?.code === "P2002"
			) {
				return false;
			}
			throw error;
		}
	}
}

