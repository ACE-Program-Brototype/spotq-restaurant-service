import { authMiddleware, type TokenVerifierConfig } from "@spotq-org/s2s-core";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "@/config/env.ts";
import { S2S_SERVICES } from "@/shared/constants/auth.constants.ts";

export function internalS2SAuthMiddleware(): RequestHandler {
	const publicKeys: Record<string, string> = {
		...(env.QUEUE_S2S_PUBLIC_KEY && {
			[S2S_SERVICES.QUEUE_SERVICE]: env.QUEUE_S2S_PUBLIC_KEY,
		}),
		...(env.ORDER_S2S_PUBLIC_KEY && {
			[S2S_SERVICES.ORDER_SERVICE]: env.ORDER_S2S_PUBLIC_KEY,
		}),
	};

	const verifierConfig: TokenVerifierConfig = {
		expectedAudience: env.S2S_AUDIENCE || S2S_SERVICES.RESTAURANT_SERVICE,
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
