import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import axios from "axios";
import { inject, injectable } from "inversify";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IUserAnalyticsService,
	UserAnalyticsSummaryDto,
	UserAnalyticsSummaryQueryDto,
} from "@/application/ports/services/user-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { CircuitBreaker } from "@/infrastructure/resilience/circuit-breaker.ts";
import { USER_SERVICE_ROUTES } from "@/shared/constants/route.constants.ts";

interface UserSummaryApiResponse {
	success?: boolean;
	data?: UserAnalyticsSummaryDto | null;
}

@injectable()
export class UserAnalyticsService implements IUserAnalyticsService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey: string;
	private readonly circuitBreaker: CircuitBreaker;

	constructor(
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
		baseUrl: string = env.USER_SERVICE_URL,
		serviceName: string = env.S2S_AUDIENCE || "restaurant-service",
		targetServiceName: string = env.USER_SERVICE_NAME || "user-service",
		privateKey?: string,
	) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.serviceName = serviceName;
		this.targetServiceName = targetServiceName;
		this.privateKey = privateKey ?? env.S2S_PRIVATE_KEY;
		this.circuitBreaker = new CircuitBreaker("user-service", {
			failureThreshold: 5,
			cooldownPeriodMs: 30_000,
			requestTimeoutMs: 3_000,
		});
	}

	private getInternalHeaders(callerUserId?: string): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "application/json",
			"X-Caller-Service": this.serviceName,
			"x-user-id": callerUserId || "system-admin",
			"x-user-role": "admin",
		};

		if (this.privateKey) {
			try {
				const issuerConfig: TokenIssuerConfig = {
					serviceName: this.serviceName,
					privateKey: this.privateKey,
				};
				const token = generateToken(this.targetServiceName, issuerConfig);
				headers.Authorization = `Bearer ${token}`;
			} catch (error) {
				this.logger.error(
					{ error, targetServiceName: this.targetServiceName },
					"Failed to generate S2S token for user-service",
				);
			}
		}

		return headers;
	}

	public async getUserSummary(
		query?: UserAnalyticsSummaryQueryDto,
		callerUserId?: string,
	): Promise<UserAnalyticsSummaryDto | null> {
		try {
			return await this.circuitBreaker.execute(async (signal) => {
				const url = `${this.baseUrl}${USER_SERVICE_ROUTES.ANALYTICS_USERS_SUMMARY}`;
				const response = await axios.get<UserSummaryApiResponse>(url, {
					headers: this.getInternalHeaders(callerUserId),
					params: {
						period: query?.period,
						day: query?.day,
						month: query?.month,
						year: query?.year,
					},
					signal,
				});

				if (response.data?.success && response.data?.data) {
					return response.data.data;
				}

				this.logger.warn(
					{ response: response.data },
					"User service returned unsuccessful summary response",
				);
				return null;
			});
		} catch (error) {
			this.logger.warn(
				{ error, circuitState: this.circuitBreaker.getState() },
				"Failed to fetch user summary from user-service",
			);
			return null;
		}
	}

	public getCircuitBreaker(): CircuitBreaker {
		return this.circuitBreaker;
	}
}
