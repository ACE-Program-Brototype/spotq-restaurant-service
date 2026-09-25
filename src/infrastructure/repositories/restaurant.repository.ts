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
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto.ts";
import type {
	IRestaurantRepository,
	RestaurantApplicationDetail,
	RestaurantFilterParams,
} from "@/application/ports/repositories/restaurant.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { ONBOARDING_STATUS } from "@/domain/value-objects/onboarding-status.vo.ts";
import { RESTAURANT_STATUS } from "@/domain/value-objects/restaurant-status.vo.ts";
import { RestaurantPersistenceMapper } from "@/infrastructure/database/mappers/restaurant.mapper.ts";

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

		if (data.restaurantName !== undefined)
			updateData.restaurantName = data.restaurantName;
		if (data.email !== undefined) updateData.email = data.email;
		if (data.phone !== undefined) updateData.phone = data.phone;
		if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
		if (data.ownerEmail !== undefined) updateData.ownerEmail = data.ownerEmail;
		if (data.status !== undefined)
			updateData.status = data.status as RestaurantStatus;
		if (data.onboardingStatus !== undefined)
			updateData.onboardingStatus = data.onboardingStatus as OnboardingStatus;
		if (data.emailVerifiedAt !== undefined)
			updateData.emailVerifiedAt = data.emailVerifiedAt;
		if (data.rejectionReason !== undefined)
			updateData.rejectionReason = data.rejectionReason;
		if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked;
		if (data.blockReason !== undefined)
			updateData.blockReason = data.blockReason;
		if (data.lastLoginAt !== undefined)
			updateData.lastLoginAt = data.lastLoginAt;
		if (data.isSubscriptionActive !== undefined)
			updateData.isSubscriptionActive = data.isSubscriptionActive;
		if (data.subscriptionPlanCode !== undefined)
			updateData.subscriptionPlanCode = data.subscriptionPlanCode;
		if (data.subscriptionEndsAt !== undefined)
			updateData.subscriptionEndsAt = data.subscriptionEndsAt;

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
					include: {
						staff: true,
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
						coverImage: raw.profile.coverImageKey,
						avatar: raw.profile.avatarUpdatedAt
							? `restaurants/${raw.id}/profile/avatar.png`
							: null,
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
			staff: (raw.staff || []).map((membership) => ({
				id: membership.id,
				fullname: membership.staff?.fullname ?? "",
				email: membership.staff?.email ?? "",
				phone: membership.staff?.phone ?? "",
				role: membership.role,
				status: membership.status,
				avatarUrl: membership.staff?.avatarUrl ?? null,
				createdAt: membership.createdAt,
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

		return list.map((raw) => RestaurantPersistenceMapper.toDomain(raw));
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
					coverImageKey: firstImage,
				},
				update: {
					...(firstImage ? { coverImageKey: firstImage } : {}),
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

	private mapRawToApplicationDetail(
		raw: Prisma.RestaurantGetPayload<{
			include: {
				address: true;
				documents: true;
				images: true;
			};
		}>,
	): RestaurantApplicationDetail {
		return {
			id: raw.id,
			restaurantName: raw.restaurantName,
			email: raw.email,
			phone: raw.phone,
			ownerName: raw.ownerName,
			ownerEmail: raw.ownerEmail,
			status: raw.status,
			onboardingStatus: raw.onboardingStatus,
			emailVerifiedAt: raw.emailVerifiedAt,
			rejectionReason: raw.rejectionReason,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			address: raw.address
				? {
						id: raw.address.id,
						restaurantId: raw.address.restaurantId,
						addressLine1: raw.address.addressLine1,
						addressLine2: raw.address.addressLine2,
						city: raw.address.city,
						state: raw.address.state,
						country: raw.address.country,
						pincode: raw.address.pincode,
						latitude: Number(raw.address.latitude),
						longitude: Number(raw.address.longitude),
						createdAt: raw.address.createdAt,
						updatedAt: raw.address.updatedAt,
					}
				: null,
			documents: (raw.documents || []).map((doc) => ({
				id: doc.id,
				restaurantId: doc.restaurantId,
				documentType: doc.documentType,
				documentName: doc.documentName,
				documentKey: doc.documentKey,
				verificationStatus: doc.verificationStatus,
				uploadedAt: doc.uploadedAt,
			})),
			images: (raw.images || []).map((img) => ({
				id: img.id,
				restaurantId: img.restaurantId,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
				createdAt: img.createdAt,
			})),
		};
	}

	async updateLastLogin(id: string, date: Date = new Date()): Promise<void> {
		await this.prisma.restaurant.update({
			where: { id },
			data: { lastLoginAt: date },
		});
	}

	async findApplicationsWithFilters(params: {
		page: number;
		limit: number;
		status?: "PENDING" | "REJECTED";
		search?: string;
		fromDate?: Date;
		toDate?: Date;
		sortBy: "createdAt" | "updatedAt" | "restaurantName" | "status";
		sortOrder: "asc" | "desc";
	}): Promise<{ restaurants: RestaurantApplicationDetail[]; total: number }> {
		const { page, limit, status, search, fromDate, toDate, sortBy, sortOrder } =
			params;

		const statusFilter = status
			? status
			: { in: ["PENDING" as const, "REJECTED" as const] };

		const where: Prisma.RestaurantWhereInput = {
			onboardingStatus: "COMPLETED",
			status: statusFilter,
			...(search && {
				OR: [
					{
						restaurantName: {
							contains: search,
							mode: "insensitive",
						},
					},
					{ ownerName: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{ phone: { contains: search, mode: "insensitive" } },
				],
			}),
			...(fromDate || toDate
				? {
						createdAt: {
							...(fromDate && { gte: fromDate }),
							...(toDate && { lte: toDate }),
						},
					}
				: {}),
		};

		const skip = (page - 1) * limit;

		const [rawList, total] = await Promise.all([
			this.prisma.restaurant.findMany({
				where,
				include: {
					address: true,
					documents: true,
					images: {
						orderBy: {
							displayOrder: "asc",
						},
					},
				},
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			this.prisma.restaurant.count({ where }),
		]);

		return {
			restaurants: rawList.map((raw) => this.mapRawToApplicationDetail(raw)),
			total,
		};
	}

	async findByIdWithDetails(
		id: string,
	): Promise<RestaurantApplicationDetail | null> {
		const raw = await this.prisma.restaurant.findUnique({
			where: { id },
			include: {
				address: true,
				documents: true,
				images: {
					orderBy: {
						displayOrder: "asc",
					},
				},
			},
		});

		if (!raw) return null;

		return this.mapRawToApplicationDetail(raw);
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
				id: raw.id,
				name: raw.restaurantName,
				phone: raw.phone,
				ownerName: raw.ownerName,
			},
			profile: {
				logo: null,
				avatarUpdatedAt: raw.profile?.avatarUpdatedAt ?? null,
				coverImage: raw.profile?.coverImageKey ?? null,
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
				seatingCapacity: raw.settings?.seatingCapacity ?? 0,
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
				if (data.profile.avatarUpdatedAt !== undefined) {
					profileData.avatarUpdatedAt = data.profile.avatarUpdatedAt;
				} else if (data.profile.hasAvatar !== undefined) {
					profileData.avatarUpdatedAt = data.profile.hasAvatar
						? new Date()
						: null;
				} else if (data.profile.logoKey !== undefined) {
					profileData.avatarUpdatedAt = data.profile.logoKey
						? new Date()
						: null;
				}
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
				if (data.settings.isOpened !== undefined)
					settingsData.isOpened = data.settings.isOpened;
				if (data.settings.isPreorder !== undefined)
					settingsData.isPreorder = data.settings.isPreorder;
				if (data.settings.seatingCapacity !== undefined)
					settingsData.seatingCapacity = data.settings.seatingCapacity;
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
