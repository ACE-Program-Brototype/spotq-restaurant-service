import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import { getRequestContext } from "@/infrastructure/observability/async-storage.ts";
import { ANALYTICS_FALLBACKS } from "@/shared/constants/analytics.constants.ts";

export interface S2SHeadersConfig {
	serviceName: string;
	targetServiceName: string;
	privateKey?: string;
	callerUserId?: string;
	logger?: ILogger;
}

/**
 * Builds standardized S2S headers including service identity, role,
 * signed asymmetric JWT Authorization bearer token, and distributed tracing headers.
 */
export function buildInternalS2SHeaders(
	config: S2SHeadersConfig,
): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Caller-Service": config.serviceName,
		"x-user-id": config.callerUserId || ANALYTICS_FALLBACKS.SYSTEM_ADMIN_CALLER,
		"x-user-role": ANALYTICS_FALLBACKS.ADMIN_ROLE,
	};

	const store = getRequestContext();
	if (store?.correlationId) {
		headers["X-Correlation-ID"] = store.correlationId;
		headers["x-correlation-id"] = store.correlationId;
		headers["X-Request-ID"] = store.requestId || store.correlationId;
		headers["x-request-id"] = store.requestId || store.correlationId;
	}
	if (store?.traceId) {
		headers["X-Trace-ID"] = store.traceId;
		headers["x-trace-id"] = store.traceId;
		if (store.spanId) {
			headers.traceparent = `00-${store.traceId}-${store.spanId}-01`;
		}
	}

	if (config.privateKey) {
		try {
			const issuerConfig: TokenIssuerConfig = {
				serviceName: config.serviceName,
				privateKey: config.privateKey,
			};
			const token = generateToken(config.targetServiceName, issuerConfig);
			headers.Authorization = `Bearer ${token}`;
		} catch (error) {
			config.logger?.error(
				{ error, targetServiceName: config.targetServiceName },
				`Failed to generate S2S token for ${config.targetServiceName}`,
			);
		}
	}

	return headers;
}
