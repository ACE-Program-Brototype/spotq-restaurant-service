import type { ILogger } from "@application/ports/services/logger.interface";
import { SUBSCRIPTION_PLAN } from "@domain/value-objects/subscription-plan.vo";
import { inject, injectable } from "inversify";
import type {
	CustomerRestaurantDetailsInputDTO,
	CustomerRestaurantDetailsOutputDTO,
	CustomerRestaurantQueueStatusDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import { CustomerRestaurantDetailsMapper } from "@/application/mappers/customer-restaurant-details.mapper.ts";
import type { IQueueService } from "@/application/ports/services/queue.service.port.ts";
import type { IGetCustomerRestaurantDetailsUseCase } from "@/application/ports/use-cases/restaurant/get-customer-restaurant-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetCustomerRestaurantDetailsUseCase
	implements IGetCustomerRestaurantDetailsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Services.QueueService)
		private readonly queueService: IQueueService,
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	public async execute(
		dto: CustomerRestaurantDetailsInputDTO,
	): Promise<CustomerRestaurantDetailsOutputDTO> {
		const includeMenu = dto.includeMenu ?? true;
		const record =
			await this.restaurantRepository.findCustomerRestaurantDetails({
				restaurantId: dto.restaurantId,
				includeMenu,
				categoryId: dto.categoryId,
			});

		if (!record) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		record.restaurant.ensureCustomerAccess(new Date());
		let queueStatus: CustomerRestaurantQueueStatusDTO = {
			hasJoinedAnyQueue: false,
			hasJoinedThisRestaurantQueue: false,
			isGuestUser: !dto.userId,
			isQueueStatusAvailable: true,
		};

		if (
			dto.userId &&
			record.restaurant.subscriptionPlanCode === SUBSCRIPTION_PLAN.QUEUE_PRO
		) {
			try {
				const status = await this.queueService.getQueueStatus({
					restaurantId: dto.restaurantId,
					userId: dto.userId,
				});
				if (status) {
					queueStatus = { ...status, isQueueStatusAvailable: true };
				}
			} catch {
				// Preserve default queue status when the queue service is unavailable.
				this.logger.error("[ERROR]: QUEUE SERVICE ERROR");
				queueStatus = {
					hasJoinedAnyQueue: null,
					hasJoinedThisRestaurantQueue: null,
					isGuestUser: false,
					isQueueStatusAvailable: false,
				};
			}
		}

		return CustomerRestaurantDetailsMapper.toDTO(
			record,
			includeMenu,
			queueStatus,
		);
	}
}
