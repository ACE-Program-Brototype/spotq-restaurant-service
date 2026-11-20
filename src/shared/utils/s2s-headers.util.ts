import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
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
 * and signed asymmetric JWT Authorization bearer token.
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
