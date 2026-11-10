import { container } from "@di/container.ts";
import { TYPES } from "@di/types.ts";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { rabbitmqClient } from "@/infrastructure/rabbitmq/rabbitmq.client.ts";
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

export async function startSubscriptionConsumer(): Promise<void> {
	const activateSubscriptionUseCase =
		container.get<IActivateSubscriptionUseCase>(
			TYPES.UseCases.ActivateSubscriptionUseCase,
		);

	await rabbitmqClient.consumeFromQueue<SubscriptionEventMessage>(
		RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
		async (message) => {
			if (message.eventType === JOB_NAMES.SUBSCRIPTION.ACTIVATED) {
				const {
					eventId,
					subscriptionId,
					restaurantId,
					planCode,
					currentPeriodEnd,
				} = message;

				logger.info(
					{
						eventId,
						restaurantId,
						planCode,
						event: "SUBSCRIPTION_EVENT_PROCESSING",
					},
					"Processing subscription.activated event from RabbitMQ",
				);

				const processed = await activateSubscriptionUseCase.execute({
					eventId,
					subscriptionId,
					restaurantId,
					planCode,
					currentPeriodEnd,
				});

				if (!processed) {
					logger.info(
						{ eventId, restaurantId },
						"Subscription event already processed. Skipping idempotently.",
					);
					return;
				}

				logger.info(
					{
						subscriptionId,
						restaurantId,
						planCode,
						event: "SUBSCRIPTION_EVENT_COMPLETED",
					},
					"Restaurant subscription activated and cached successfully",
				);
			} else {
				logger.warn(
					{ eventType: message.eventType, eventId: message.eventId },
					"Unhandled subscription event type from RabbitMQ",
				);
			}
		},
	);

	logger.info(
		{ queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS },
		"RabbitMQ subscription consumer started and listening for events",
	);
}

