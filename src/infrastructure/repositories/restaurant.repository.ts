import type { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import type { CreateRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/di/types";
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
}
