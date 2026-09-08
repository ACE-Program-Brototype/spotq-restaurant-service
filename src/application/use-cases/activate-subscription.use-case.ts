import { inject, injectable } from "inversify";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type {
	ActivateSubscriptionInput,
	IActivateSubscriptionUseCase,
} from "@/application/ports/use-cases/activate-subscription.use-case.port.ts";
import { TYPES } from "@/di/types.ts";

@injectable()
export class ActivateSubscriptionUseCase
	implements IActivateSubscriptionUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(input: ActivateSubscriptionInput): Promise<boolean> {
		const { restaurantId, planCode, currentPeriodEnd, eventId } = input;
		return await this.restaurantRepository.activateSubscription(
			restaurantId,
			planCode,
			new Date(currentPeriodEnd),
			eventId,
		);
	}
}
