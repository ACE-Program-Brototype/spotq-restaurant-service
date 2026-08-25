import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import { TYPES } from "@/di/types";
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
}
