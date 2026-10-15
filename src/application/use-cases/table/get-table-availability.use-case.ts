import type { IGetTableAvailabilityUseCase } from "@application/ports/use-cases/table/get-table-availability.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject } from "inversify";

export class GetTableAvailabilityUseCase
	implements IGetTableAvailabilityUseCase
{
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(input: { restaurantId: string; partySize: number }) {
		const settings =
			await this.restaurantRepository.getRestaurantAvailabilitySettings(
				input.restaurantId,
			);
		if (!settings) throw new RestaurantNotFoundError();

		// getting table avaiabilty
		const availability = await this.tableRepository.getAvailability(
			input.restaurantId,
		);

		const availableCount = availability.availableTableCapacities.length;

		const totalAvailableCount = availability.availableTableCapacities.reduce(
			(acc, cur) => acc + cur,
			0,
		);

		return {
			restaurantId: availability.restaurantId,
			isOpen: settings.isOpened,
			acceptsQueue: settings.acceptsQueue,
			isTableAvailable: totalAvailableCount >= input.partySize,
			availableCount,
		};
	}
}
