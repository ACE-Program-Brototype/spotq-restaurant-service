import type { DocumentType, Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import type {
	CreateRestaurantDto,
	OnboardRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
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
		if (data.restaurantName !== undefined)
			updateData.restaurantName = data.restaurantName;
		if (data.email !== undefined) updateData.email = data.email;
		if (data.phone !== undefined) updateData.phone = data.phone;
		if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
		if (data.ownerEmail !== undefined) updateData.ownerEmail = data.ownerEmail;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.onboardingStatus !== undefined)
			updateData.onboardingStatus = data.onboardingStatus;
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
		restaurantId: string,
		dto: OnboardRestaurantDto,
	): Promise<Restaurant> {
		const documentTypeMap: Record<string, DocumentType> = {
			fssai: "FSSAI",
			businessRegistration: "BUSINESS_REGISTRATION",
			ownerIdentity: "OWNER_IDENTITY",
			gst: "GST",
			businessPan: "BUSINESS_PAN",
		};

		return await this.prisma.$transaction(async (tx) => {
			const updatedRaw = await tx.restaurant.update({
				where: { id: restaurantId },
				data: {
					restaurantName: dto.restaurantName,
					phone: dto.phone,
					ownerName: dto.ownerName,
					onboardingStatus: "COMPLETED",
					status: "PENDING",
				},
			});

			if (dto.seatingCapacity !== undefined) {
				await tx.restaurantSettings.upsert({
					where: { restaurantId },
					create: {
						restaurantId,
						seatingCapacity: dto.seatingCapacity,
					},
					update: {
						seatingCapacity: dto.seatingCapacity,
					},
				});
			}

			if (dto.location) {
				await tx.restaurantAddress.upsert({
					where: { restaurantId },
					create: {
						restaurantId,
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
				await tx.restaurantDocument.deleteMany({
					where: { restaurantId },
				});

				const docEntries = Object.entries(dto.documents)
					.filter(([key, doc]) => doc && documentTypeMap[key])
					.map(([key, doc]) => ({
						restaurantId,
						documentType: documentTypeMap[key] as DocumentType,
						documentName: doc.documentName,
						documentKey: doc.documentKey,
					}));

				if (docEntries.length > 0) {
					await tx.restaurantDocument.createMany({
						data: docEntries,
					});
				}
			}

			if (dto.restaurantImages && dto.restaurantImages.length > 0) {
				await tx.restaurantImage.deleteMany({
					where: { restaurantId },
				});

				const imgEntries = dto.restaurantImages.map((img, index) => ({
					restaurantId,
					objectKey: img.objectKey,
					displayOrder: img.displayOrder ?? index + 1,
				}));

				await tx.restaurantImage.createMany({
					data: imgEntries,
				});
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
}
