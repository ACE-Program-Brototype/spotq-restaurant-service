import type { ISubscriptionConsumer } from "@/application/ports/consumers/subscription.consumer.port";
import { container } from "./container";
import { TYPES } from "./types";

export const subscriptionConsumer = container.get<ISubscriptionConsumer>(
	TYPES.Consumers.SubscriptionConsumer,
);
