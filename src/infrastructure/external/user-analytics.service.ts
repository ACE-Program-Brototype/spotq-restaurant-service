import type { CircuitBreaker } from "@spotq-org/circuit-breaker";
import axios from "axios";
import { inject, injectable } from "inversify";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IUserAnalyticsService,
	UserAnalyticsSummaryDTO,
	UserAnalyticsSummaryQueryDTO,
} from "@/application/ports/services/user-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { createServiceCircuitBreaker } from "@/infrastructure/resilience/circuit-breaker.factory.ts";
import { USER_SERVICE_ROUTES } from "@/shared/constants/route.constants.ts";
import { buildInternalS2SHeaders } from "@/shared/utils/s2s-headers.util.ts";

interface UserSummaryApiResponse {
	success?: boolean;
	data?: UserAnalyticsSummaryDTO | null;
}

@injectable()
export class UserAnalyticsService implements IUserAnalyticsService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey: string;
	private readonly circuitBreaker: CircuitBreaker<
		[() => Promise<unknown>],
		unknown
	>;

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
		this.circuitBreaker = createServiceCircuitBreaker({
			name: "user-service",
		});
	}

	private getHeaders(callerUserId?: string): Record<string, string> {
		return buildInternalS2SHeaders({
			serviceName: this.serviceName,
			targetServiceName: this.targetServiceName,
			privateKey: this.privateKey,
			callerUserId,
			logger: this.logger,
		});
	}

	public async getUserSummary(
		query?: UserAnalyticsSummaryQueryDTO,
		callerUserId?: string,
	): Promise<UserAnalyticsSummaryDTO | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
				const url = `${this.baseUrl}${USER_SERVICE_ROUTES.ANALYTICS_USERS_SUMMARY}`;
				const response = await axios.get<UserSummaryApiResponse>(url, {
					headers: this.getHeaders(callerUserId),
					params: {
						period: query?.period,
						day: query?.day,
						month: query?.month,
						year: query?.year,
					},
					timeout: env.CIRCUIT_BREAKER_TIMEOUT_MS,
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
			return (result as UserAnalyticsSummaryDTO | null) ?? null;
		} catch (error) {
			this.logger.warn(
				{ error, circuitState: this.circuitBreaker.state },
				"Failed to fetch user summary from user-service",
			);
			return null;
		}
	}
}
