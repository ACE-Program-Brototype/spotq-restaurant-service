import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port";
import {
	type SubscriptionEventMessage,
	startSubscriptionConsumer,
} from "@/infrastructure/rabbitmq/consumers/subscription.consumer";
import { rabbitmqClient } from "@/infrastructure/rabbitmq/rabbitmq.client";
import { JOB_NAMES, RABBITMQ_QUEUES } from "@/shared/constants/queue.constants";

jest.mock("@/infrastructure/observability/logger", () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

describe("SubscriptionConsumer (RabbitMQ)", () => {
	let mockActivateSubscriptionUseCase: jest.Mocked<IActivateSubscriptionUseCase>;
	let capturedHandler: (
		message: SubscriptionEventMessage,
		rawMessage?: unknown,
	) => Promise<void>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockActivateSubscriptionUseCase = {
			execute: jest.fn<IActivateSubscriptionUseCase["execute"]>(),
		};

		if (container.isBound(TYPES.UseCases.ActivateSubscriptionUseCase)) {
			container
				.rebind(TYPES.UseCases.ActivateSubscriptionUseCase)
				.toConstantValue(mockActivateSubscriptionUseCase);
		} else {
			container
				.bind(TYPES.UseCases.ActivateSubscriptionUseCase)
				.toConstantValue(mockActivateSubscriptionUseCase);
		}

		jest
			.spyOn(rabbitmqClient, "consumeFromQueue")
			.mockImplementation(async (_queue: string, handler: unknown) => {
				capturedHandler = handler as typeof capturedHandler;
			});
	});

	it("should register consumer on the correct queue", async () => {
		await startSubscriptionConsumer();

		expect(rabbitmqClient.consumeFromQueue).toHaveBeenCalledWith(
			RABBITMQ_QUEUES.SUBSCRIPTION_EVENTS,
			expect.any(Function),
		);
	});

	it("should process subscription.activated event successfully", async () => {
		await startSubscriptionConsumer();

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
	});

	it("should skip idempotently when event was already processed", async () => {
		await startSubscriptionConsumer();

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
	});

	it("should ignore unhandled event types", async () => {
		await startSubscriptionConsumer();

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
	});
});
