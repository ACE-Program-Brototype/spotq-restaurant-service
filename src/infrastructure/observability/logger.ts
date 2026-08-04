import pino from "pino";

export const logger = pino({
	level: "info",

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
