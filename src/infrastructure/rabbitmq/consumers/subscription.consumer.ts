import type { RabbitMQClient } from "@spotq-org/rabbitmq-client";
import { inject, injectable } from "inversify";
import type { ISubscriptionConsumer } from "@/application/ports/consumers/subscription.consumer.port.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	JOB_NAMES,
	RABBITMQ_QUEUES,
} from "@/shared/constants/queue.constants.ts";

export interface SubscriptionEventMessage {
	eventId: string;
	eventType: string;
	aggregateId?: string;
	subscriptionId: string;
	restaurantId: string;
	planCode: string;
	status: string;
	currentPeriodStart?: string;
	currentPeriodEnd: string;
	timestamp?: string;
}


@injectable()
export class SubscriptionConsumer implements ISubscriptionConsumer {
	constructor(
		@inject(TYPES.UseCases.ActivateSubscriptionUseCase)
		private readonly activateSubscriptionUseCase: IActivateSubscriptionUseCase,

		@inject(TYPES.RabbitMQ.Client)
		private readonly rabbitmqClient: RabbitMQClient,

		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	async start(): Promise<void> {
		await this.rabbitmqClient.consumeFromQueue<SubscriptionEventMessage>(
			RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
			this.handleMessage.bind(this),
		);

		this.logger.info(
			{ queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS },
			"RabbitMQ subscription consumer started and listening for events",
		);
	}

	async handleMessage(message: SubscriptionEventMessage): Promise<void> {
		if (message.eventType === JOB_NAMES.SUBSCRIPTION.ACTIVATED) {
			const {
				eventId,
				subscriptionId,
				restaurantId,
				planCode,
				currentPeriodEnd,
			} = message;

			this.logger.info(
				{
					eventId,
					restaurantId,
					planCode,
					event: "SUBSCRIPTION_EVENT_PROCESSING",
				},
				"Processing subscription.activated event from RabbitMQ",
			);

			const processed = await this.activateSubscriptionUseCase.execute({
				eventId,
				subscriptionId,
				restaurantId,
				planCode,
				currentPeriodEnd,
			});

			if (!processed) {
				this.logger.info(
					{ eventId, restaurantId },
					"Subscription event already processed. Skipping idempotently.",
				);
				return;
			}

			this.logger.info(
				{
					subscriptionId,
					restaurantId,
					planCode,
					event: "SUBSCRIPTION_EVENT_COMPLETED",
				},
				"Restaurant subscription activated and cached successfully",
			);
			return;
		}

		this.logger.warn(
			{ eventType: message.eventType, eventId: message.eventId },
			"Unhandled subscription event type from RabbitMQ",
		);
	}
}
