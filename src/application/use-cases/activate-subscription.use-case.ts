import { inject, injectable } from "inversify";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
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
		@inject(TYPES.EmailQueuePort)
		private readonly emailQueuePort: IEmailQueuePort,
	) {}

	async execute(input: ActivateSubscriptionInput): Promise<boolean> {
		const { restaurantId, planCode, currentPeriodEnd, eventId } = input;
		const activated = await this.restaurantRepository.activateSubscription(
			restaurantId,
			planCode,
			new Date(currentPeriodEnd),
			eventId,
		);

		if (!activated) {
			return false;
		}

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (restaurant?.ownerEmail) {
			await this.emailQueuePort.sendSubscriptionActivatedEmail({
				to: restaurant.ownerEmail,
				ownerName: restaurant.ownerName,
				restaurantName: restaurant.restaurantName,
				planCode,
				subscriptionEndsAt: new Date(currentPeriodEnd),
			});
		}

		return true;
	}
}
