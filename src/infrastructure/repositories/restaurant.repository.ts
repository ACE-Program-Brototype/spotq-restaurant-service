import type { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import type {
	CreateRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type {
	IRestaurantRepository,
	RestaurantApplicationDetail,
} from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/config/di/types";
import { Restaurant } from "@/domain/entities/restaurant.entity";
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
		if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason;
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

	async findApplicationsWithFilters(
		params: {
			page: number;
			limit: number;
			status?: "PENDING" | "REJECTED";
			search?: string;
			fromDate?: Date;
			toDate?: Date;
			sortBy: "createdAt" | "updatedAt" | "restaurantName" | "status";
			sortOrder: "asc" | "desc";
		},
	): Promise<{ restaurants: RestaurantApplicationDetail[]; total: number }> {
		const {
			page,
			limit,
			status,
			search,
			fromDate,
			toDate,
			sortBy,
			sortOrder,
		} = params;

		const statusFilter = status
			? status
			: { in: ["PENDING" as const, "REJECTED" as const] };

		const where: Prisma.RestaurantWhereInput = {
			onboardingStatus: "COMPLETED",
			status: statusFilter,
			...(search && {
				OR: [
					{ restaurantName: { contains: search, mode: "insensitive" } },
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
}
