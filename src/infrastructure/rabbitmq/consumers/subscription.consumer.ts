import crypto from "node:crypto";
import type { RabbitMQClient } from "@spotq-org/rabbitmq-client";
import { inject, injectable } from "inversify";
import type { ISubscriptionConsumer } from "@/application/ports/consumers/subscription.consumer.port.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { requestContextStorage } from "@/infrastructure/observability/async-storage.ts";
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
	correlationId?: string;
	correlation_id?: string;
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
			{
				job: {
					queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
					status: "LISTENING",
				},
			},
			"RabbitMQ subscription consumer started and listening for events",
		);
	}

	async handleMessage(message: SubscriptionEventMessage): Promise<void> {
		const correlationId =
			message?.correlationId ||
			message?.correlation_id ||
			message?.eventId ||
			crypto.randomUUID();

		await requestContextStorage.run(
			{
				correlationId,
				requestId: correlationId,
				restaurantId: message.restaurantId,
			},
			async () => {
				const startTime = process.hrtime.bigint();
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
							job: {
								queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
								routing_key: message.eventType,
								job_id: eventId,
								status: "PROCESSING",
							},
							context: {
								event_id: eventId,
								subscription_id: subscriptionId,
								restaurant_id: restaurantId,
								plan_code: planCode,
							},
						},
						"Processing subscription.activated event from RabbitMQ",
					);

					try {
						const processed = await this.activateSubscriptionUseCase.execute({
							eventId,
							subscriptionId,
							restaurantId,
							planCode,
							currentPeriodEnd,
						});

						const endTime = process.hrtime.bigint();
						const durationMs =
							Math.round((Number(endTime - startTime) / 1_000_000) * 10) / 10;

						if (!processed) {
							this.logger.info(
								{
									job: {
										queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
										routing_key: message.eventType,
										job_id: eventId,
										duration_ms: durationMs,
										status: "SKIPPED",
									},
									context: {
										event_id: eventId,
										restaurant_id: restaurantId,
									},
								},
								"Subscription event already processed. Skipping idempotently.",
							);
							return;
						}

						this.logger.info(
							{
								job: {
									queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
									routing_key: message.eventType,
									job_id: eventId,
									duration_ms: durationMs,
									status: "COMPLETED",
								},
								context: {
									subscription_id: subscriptionId,
									restaurant_id: restaurantId,
									plan_code: planCode,
								},
							},
							"Restaurant subscription activated and cached successfully",
						);
					} catch (error) {
						const endTime = process.hrtime.bigint();
						const durationMs =
							Math.round((Number(endTime - startTime) / 1_000_000) * 10) / 10;
						this.logger.error(
							{
								err: error,
								job: {
									queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
									routing_key: message.eventType,
									job_id: eventId,
									duration_ms: durationMs,
									status: "FAILED",
								},
								context: {
									event_id: eventId,
									restaurant_id: restaurantId,
								},
							},
							"Failed to process subscription event from RabbitMQ",
						);
						throw error;
					}
					return;
				}

				this.logger.warn(
					{
						job: {
							queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
							routing_key: message.eventType,
							status: "UNHANDLED",
						},
						context: {
							event_type: message.eventType,
							event_id: message.eventId,
						},
					},
					"Unhandled subscription event type from RabbitMQ",
				);
			},
		);
	}
}
