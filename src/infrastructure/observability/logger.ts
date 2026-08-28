import pino from "pino";
import { env } from "@/config/env.ts";
import { getRequestContext } from "./async-storage.ts";

export const logger = pino({
	level: env.LOG_LEVEL || "info",

	base: {
		service: "restaurant-service",
		version: "1.0.0",
	},

	timestamp: pino.stdTimeFunctions.isoTime,

	messageKey: "message",

	mixin() {
		const context = getRequestContext();
		if (!context) {
			return {};
		}
		return {
			requestId: context.requestId,
			...(context.correlationId && { correlationId: context.correlationId }),
			...(context.userId && { userId: context.userId }),
			...(context.restaurantId && { restaurantId: context.restaurantId }),
		};
	},

	formatters: {
		level(label) {
			return {
				level: label.toUpperCase(),
			};
		},
	},
});
