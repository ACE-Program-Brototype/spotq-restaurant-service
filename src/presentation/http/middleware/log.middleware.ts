import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { requestContextStorage } from "@/infrastructure/observability/async-storage.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

function parseTraceparent(header?: string): {
	traceId?: string;
	spanId?: string;
} {
	if (!header) return {};
	const parts = header.split("-");
	if (parts.length >= 3 && parts[1] && parts[2]) {
		return { traceId: parts[1], spanId: parts[2] };
	}
	return {};
}

export function httpLogger(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const start = process.hrtime.bigint();

	const requestId =
		req.get("X-Request-ID")?.trim() ||
		req.get("x-request-id")?.trim() ||
		crypto.randomUUID();

	const correlationId =
		req.get("X-Correlation-ID")?.trim() ||
		req.get("x-correlation-id")?.trim() ||
		requestId;

	const traceparent = parseTraceparent(req.get("traceparent") || undefined);
	const traceId =
		req.get("X-Trace-ID")?.trim() ||
		req.get("x-trace-id")?.trim() ||
		traceparent.traceId;
	const spanId =
		req.get("X-Span-ID")?.trim() ||
		req.get("x-span-id")?.trim() ||
		traceparent.spanId;

	res.locals.requestId = requestId;
	res.locals.correlationId = correlationId;
	res.setHeader("X-Request-ID", requestId);
	res.setHeader("X-Correlation-ID", correlationId);
	if (traceId) {
		res.setHeader("X-Trace-ID", traceId);
	}

	const store = {
		requestId,
		correlationId,
		...(traceId ? { traceId } : {}),
		...(spanId ? { spanId } : {}),
	};

	requestContextStorage.run(store, () => {
		const path = req.originalUrl || req.url;

		logger.debug(
			{
				http: {
					method: req.method,
					path,
					client_ip: req.ip || req.socket?.remoteAddress,
				},
				headers: {
					host: req.headers.host,
					userAgent: req.get("user-agent"),
				},
			},
			"Incoming request",
		);

		res.on("finish", () => {
			const durationMs =
				Math.round((Number(process.hrtime.bigint() - start) / 1_000_000) * 10) /
				10;
			const finalPath = req.originalUrl || req.url;

			logger.info(
				{
					http: {
						method: req.method,
						path: finalPath,
						status_code: res.statusCode,
						duration_ms: durationMs,
						client_ip: req.ip || req.socket?.remoteAddress,
					},
				},
				`HTTP ${req.method} ${finalPath} ${res.statusCode} (${durationMs}ms)`,
			);
		});

		next();
	});
}

export const loggerMiddleware = httpLogger;
