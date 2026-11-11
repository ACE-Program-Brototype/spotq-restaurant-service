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
			{ queue: RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS },
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
				subscriptionId: "sub-456",
				restaurantId: "rest-789",
				planCode: "PRO_MONTHLY",
				event: "SUBSCRIPTION_EVENT_COMPLETED",
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
			{ eventId: "evt-dup-123", restaurantId: "rest-789" },
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
			{ eventType: "unknown.event", eventId: "evt-unknown" },
			"Unhandled subscription event type from RabbitMQ",
		);
	});
});
