import {
	DocumentType,
	DocumentVerificationStatus,
	OnboardingStatus,
	type Prisma,
	type PrismaClient,
	RestaurantStatus,
} from "@prisma/client";
import { inject, injectable } from "inversify";
import type {
	CreateRestaurantDto,
	OnboardRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/config/di/types";
import { Restaurant } from "@/domain/entities/restaurant.entity";
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

	async getRestaurantProfileDetails(
		restaurantId: string,
	): Promise<RestaurantProfileResponseDto | null> {
		const raw = await this.prisma.restaurant.findUnique({
			where: { id: restaurantId },
			include: {
				profile: true,
				settings: true,
				operatingHours: {
					orderBy: { dayOfWeek: "asc" },
				},
			},
		});

		if (!raw) return null;

		const formatTime = (time: unknown): string | null => {
			if (!time) return null;
			if (typeof time === "string") {
				if (time.includes("T")) {
					const d = new Date(time);
					if (!Number.isNaN(d.getTime())) {
						return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
					}
				}
				return time.slice(0, 5);
			}
			if (time instanceof Date && !Number.isNaN(time.getTime())) {
				const hours = time.getUTCHours().toString().padStart(2, "0");
				const minutes = time.getUTCMinutes().toString().padStart(2, "0");
				return `${hours}:${minutes}`;
			}
			return null;
		};

		return {
			restaurant: {
				name: raw.restaurantName,
				phone: raw.phone,
				ownerName: raw.ownerName,
			},
			profile: {
				logo: raw.profile?.logoKey ?? raw.profile?.avatar ?? null,
				coverImage:
					raw.profile?.coverImageKey ?? raw.profile?.coverImage ?? null,
				description: raw.profile?.description ?? null,
				cuisineType:
					raw.profile?.cuisineType ?? raw.settings?.cuisineType ?? null,
				averageCost: raw.profile?.averageCost ?? 0,
			},
			settings: {
				acceptsQueue: raw.settings?.acceptsQueue ?? true,
				acceptsQrOrders: raw.settings?.acceptsQrOrders ?? true,
				loyaltyEnabled:
					raw.settings?.loyaltyEnabled ??
					raw.settings?.isLoyaltyEnabled ??
					false,
				autoAcceptQueue: raw.settings?.autoAcceptQueue ?? false,
			},
			businessHours: raw.operatingHours.map((oh) => ({
				dayOfWeek: oh.dayOfWeek,
				openTime: formatTime(oh.openTime),
				closeTime: formatTime(oh.closeTime),
				isClosed: oh.isClosed ?? !oh.isOpen,
			})),
		};
	}

	async updateProfileDetails(
		restaurantId: string,
		data: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto> {
		await this.prisma.$transaction(async (tx) => {
			if (data.restaurant) {
				const updateData: Record<string, string> = {};
				if (data.restaurant.name !== undefined)
					updateData.restaurantName = data.restaurant.name;
				if (data.restaurant.phone !== undefined)
					updateData.phone = data.restaurant.phone;
				if (data.restaurant.ownerName !== undefined)
					updateData.ownerName = data.restaurant.ownerName;

				if (Object.keys(updateData).length > 0) {
					await tx.restaurant.update({
						where: { id: restaurantId },
						data: updateData,
					});
				}
			}

			if (data.profile) {
				const profileData: Record<string, unknown> = {};
				if (data.profile.logoKey !== undefined)
					profileData.logoKey = data.profile.logoKey;
				if (data.profile.coverImageKey !== undefined)
					profileData.coverImageKey = data.profile.coverImageKey;
				if (data.profile.description !== undefined)
					profileData.description = data.profile.description;
				if (data.profile.cuisineType !== undefined)
					profileData.cuisineType = data.profile.cuisineType;
				if (data.profile.averageCost !== undefined)
					profileData.averageCost = data.profile.averageCost;

				if (Object.keys(profileData).length > 0) {
					await tx.restaurantProfile.upsert({
						where: { restaurantId },
						create: { restaurantId, ...profileData },
						update: profileData,
					});
				}
			}

			if (data.settings) {
				const settingsData: Record<string, unknown> = {};
				if (data.settings.acceptsQueue !== undefined)
					settingsData.acceptsQueue = data.settings.acceptsQueue;
				if (data.settings.acceptsQrOrders !== undefined)
					settingsData.acceptsQrOrders = data.settings.acceptsQrOrders;
				if (data.settings.loyaltyEnabled !== undefined) {
					settingsData.loyaltyEnabled = data.settings.loyaltyEnabled;
					settingsData.isLoyaltyEnabled = data.settings.loyaltyEnabled;
				}
				if (data.settings.autoAcceptQueue !== undefined)
					settingsData.autoAcceptQueue = data.settings.autoAcceptQueue;

				if (Object.keys(settingsData).length > 0) {
					await tx.restaurantSettings.upsert({
						where: { restaurantId },
						create: { restaurantId, ...settingsData },
						update: settingsData,
					});
				}
			}

			if (data.businessHours && data.businessHours.length > 0) {
				const parseTimeStringToDate = (
					timeStr?: string | null,
				): Date | null => {
					if (!timeStr) return null;
					if (timeStr.includes("T")) return new Date(timeStr);
					const parts = timeStr.split(":");
					const hours = parseInt(parts[0], 10);
					const minutes = parseInt(parts[1], 10);
					if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
					return new Date(1970, 0, 1, hours, minutes, 0);
				};

				for (const bh of data.businessHours) {
					const isClosed = bh.isClosed ?? false;
					const openTimeDate = isClosed
						? null
						: parseTimeStringToDate(bh.openTime);
					const closeTimeDate = isClosed
						? null
						: parseTimeStringToDate(bh.closeTime);

					await tx.restaurantOperatingHours.upsert({
						where: {
							restaurantId_dayOfWeek: {
								restaurantId,
								dayOfWeek: bh.dayOfWeek,
							},
						},
						create: {
							restaurantId,
							dayOfWeek: bh.dayOfWeek,
							isOpen: !isClosed,
							isClosed: isClosed,
							openTime: openTimeDate,
							closeTime: closeTimeDate,
						},
						update: {
							isOpen: !isClosed,
							isClosed: isClosed,
							openTime: openTimeDate,
							closeTime: closeTimeDate,
						},
					});
				}
			}
		});

		const updatedDetails = await this.getRestaurantProfileDetails(restaurantId);
		if (!updatedDetails) {
			throw new Error("Failed to load updated restaurant profile details");
		}
		return updatedDetails;
	}
}
