import type { Restaurant } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { inject, injectable } from "inversify";
import type { CreateRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/di/types";
import { BaseRepository } from "@/infrastructure/repositories/base.repository";

@injectable()
export class RestaurantRepository
	extends BaseRepository<Restaurant>
	implements IRestaurantRepository
{
	constructor(
		@inject(TYPES.Database.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma, "restaurant");
	}

	async existsByEmail(email: string): Promise<boolean> {
		const restaurant = await this.findUnique({ email });

		return restaurant !== null;
	}

	async createRestaurant(data: CreateRestaurantDto): Promise<Restaurant> {
		return this.create({
			restaurantName: data.restaurantName,
			email: data.email,
			phone: data.phone,
			ownerName: data.ownerName,
			ownerEmail: data.ownerEmail,
			emailVerifiedAt: data.emailVerifiedAt,
		});
	}

	async findByEmail(email: string): Promise<Restaurant | null> {
		return this.findUnique({ email });
	}
}
