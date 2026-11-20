import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { RabbitMQClient } from "@spotq-org/rabbitmq-client";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port";
import {
	SubscriptionConsumer,
	type SubscriptionEventMessage,
} from "@/infrastructure/rabbitmq/consumers/subscription.consumer";
import { JOB_NAMES, RABBITMQ_QUEUES } from "@/shared/constants/queue.constants";

describe("SubscriptionConsumer (RabbitMQ)", () => {
	let consumer: SubscriptionConsumer;
	let mockActivateSubscriptionUseCase: jest.Mocked<IActivateSubscriptionUseCase>;
	let mockRabbitMQClient: jest.Mocked<Pick<RabbitMQClient, "consumeFromQueue">>;
	let mockLogger: ILogger;
	let capturedHandler: (message: SubscriptionEventMessage) => Promise<void>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockActivateSubscriptionUseCase = {
			execute: jest.fn<IActivateSubscriptionUseCase["execute"]>(),
		};

		mockRabbitMQClient = {
			consumeFromQueue: jest
				.fn<RabbitMQClient["consumeFromQueue"]>()
				.mockImplementation(async (_queue: string, handler: unknown) => {
					capturedHandler = handler as typeof capturedHandler;
				}),
		};

		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		} as unknown as ILogger;

		consumer = new SubscriptionConsumer(
			mockActivateSubscriptionUseCase,
			mockRabbitMQClient as unknown as RabbitMQClient,
			mockLogger,
		);
	});

	it("should register consumer on the correct queue", async () => {
		await consumer.start();

		expect(mockRabbitMQClient.consumeFromQueue).toHaveBeenCalledWith(
			RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
			expect.any(Function),
		);
		expect(mockLogger.info).toHaveBeenCalledWith(
			{
				job: {
					queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
					status: "LISTENING",
				},
			},
			"RabbitMQ subscription consumer started and listening for events",
		);
	});

	it("should process subscription.activated event successfully", async () => {
		await consumer.start();

		mockActivateSubscriptionUseCase.execute.mockResolvedValue(true);

		const message: SubscriptionEventMessage = {
			eventId: "evt-123",
			eventType: JOB_NAMES.SUBSCRIPTION.ACTIVATED,
			subscriptionId: "sub-456",
			restaurantId: "rest-789",
			planCode: "PRO_MONTHLY",
			status: "ACTIVE",
			currentPeriodEnd: "2026-12-10T00:00:00.000Z",
		};

		await capturedHandler(message);

		expect(mockActivateSubscriptionUseCase.execute).toHaveBeenCalledWith({
			eventId: "evt-123",
			subscriptionId: "sub-456",
			restaurantId: "rest-789",
			planCode: "PRO_MONTHLY",
			currentPeriodEnd: "2026-12-10T00:00:00.000Z",
		});
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				job: expect.objectContaining({
					queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
					routing_key: JOB_NAMES.SUBSCRIPTION.ACTIVATED,
					status: "COMPLETED",
				}),
				context: expect.objectContaining({
					subscription_id: "sub-456",
					restaurant_id: "rest-789",
					plan_code: "PRO_MONTHLY",
				}),
			}),
			"Restaurant subscription activated and cached successfully",
		);
	});

	it("should skip idempotently when event was already processed", async () => {
		await consumer.start();

		mockActivateSubscriptionUseCase.execute.mockResolvedValue(false);

		const message: SubscriptionEventMessage = {
			eventId: "evt-dup-123",
			eventType: JOB_NAMES.SUBSCRIPTION.ACTIVATED,
			subscriptionId: "sub-456",
			restaurantId: "rest-789",
			planCode: "PRO_MONTHLY",
			status: "ACTIVE",
			currentPeriodEnd: "2026-12-10T00:00:00.000Z",
		};

		await capturedHandler(message);

		expect(mockActivateSubscriptionUseCase.execute).toHaveBeenCalledTimes(1);
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				job: expect.objectContaining({
					queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
					routing_key: JOB_NAMES.SUBSCRIPTION.ACTIVATED,
					status: "SKIPPED",
				}),
				context: expect.objectContaining({
					event_id: "evt-dup-123",
					restaurant_id: "rest-789",
				}),
			}),
			"Subscription event already processed. Skipping idempotently.",
		);
	});

	it("should ignore unhandled event types", async () => {
		await consumer.start();

		const message: SubscriptionEventMessage = {
			eventId: "evt-unknown",
			eventType: "unknown.event",
			subscriptionId: "sub-456",
			restaurantId: "rest-789",
			planCode: "PRO_MONTHLY",
			status: "ACTIVE",
			currentPeriodEnd: "2026-12-10T00:00:00.000Z",
		};

		await capturedHandler(message);

		expect(mockActivateSubscriptionUseCase.execute).not.toHaveBeenCalled();
		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({
				job: expect.objectContaining({
					queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
					routing_key: "unknown.event",
					status: "UNHANDLED",
				}),
				context: expect.objectContaining({
					event_type: "unknown.event",
					event_id: "evt-unknown",
				}),
			}),
			"Unhandled subscription event type from RabbitMQ",
		);
	});
});
