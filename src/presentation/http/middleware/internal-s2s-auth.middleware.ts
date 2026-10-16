import { authMiddleware, type TokenVerifierConfig } from "@spotq-org/s2s-core";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "@/config/env.ts";

export function internalS2SAuthMiddleware(): RequestHandler {
	const publicKeys: Record<string, string> = {
		...(env.QUEUE_S2S_PUBLIC_KEY && {
			"queue-service": env.QUEUE_S2S_PUBLIC_KEY,
		}),
		...(env.ORDER_S2S_PUBLIC_KEY && {
			"order-service": env.ORDER_S2S_PUBLIC_KEY,
		}),
	};

	const verifierConfig: TokenVerifierConfig = {
		expectedAudience: env.S2S_AUDIENCE || "restaurant-service",
		publicKeys,
	};

	const authenticateS2S = authMiddleware(verifierConfig);

	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.headers["x-caller-service"] && req.headers["x-consumer-service"]) {
			req.headers["x-caller-service"] = req.headers["x-consumer-service"];
		}

		authenticateS2S(req, res, next);
	};
}
