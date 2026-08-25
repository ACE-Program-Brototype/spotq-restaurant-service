import type { NextFunction, Request, Response } from "express";
import {
	httpErrorsTotal,
	httpRequestDuration,
	httpRequestsTotal,
} from "@/infrastructure/observability/metrics.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

export const metricsMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = (Date.now() - start) / 1000;

		const route =
			typeof req.route?.path === "string" ? req.route.path : "unmatched";

		httpRequestsTotal.inc({
			method: req.method,
			route,
			status: String(res.statusCode),
		});

		httpRequestDuration.observe(
			{
				method: req.method,
				route,
			},
			duration,
		);

		if (res.statusCode >= HTTP_STATUS.BAD_REQUEST) {
			httpErrorsTotal.inc({
				route,
				status: String(res.statusCode),
			});
		}
	});

	next();
};
