import pino from "pino";
import { env } from "@/config/env.ts";

export const logger = pino({
	level: env.LOG_LEVEL || "info",

	base: {
		service: "restaurant-service",
		version: "1.0.0",
	},

	timestamp: pino.stdTimeFunctions.isoTime,

	messageKey: "message",

	formatters: {
		level(label) {
			return {
				level: label.toUpperCase(),
			};
		},
	},
});
