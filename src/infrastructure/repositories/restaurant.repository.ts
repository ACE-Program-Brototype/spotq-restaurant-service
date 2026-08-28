import type { CreateRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/di/types";
import type { Restaurant } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { inject, injectable } from "inversify";

@injectable()
export class RestaurantRepository implements IRestaurantRepository {
	constructor(
		@inject(TYPES.Database.PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	async existsByEmail(email: string): Promise<boolean> {
		const restaurant = await this.prisma.restaurant.findUnique({
			where: {
				email,
			},
			select: {
				id: true,
			},
		});

		return restaurant !== null;
	}

	async createRestaurant(data: CreateRestaurantDto): Promise<Restaurant> {
		return this.prisma.restaurant.create({
			data: {
				restaurantName: data.restaurantName,
				email: data.email,
				phone: data.phone,
				ownerName: data.ownerName,
				ownerEmail: data.ownerEmail,
				emailVerifiedAt: data.emailVerifiedAt,
			},
		});
	}

	async findByEmail(email: string): Promise<Restaurant | null> {
		return this.prisma.restaurant.findUnique({
			where: {
				email,
			},
		});
	}
}
