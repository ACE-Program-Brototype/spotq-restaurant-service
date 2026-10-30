import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import { injectable } from "inversify";
import type { CustomerRestaurantQueueStatusDTO } from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import type {
	GetRestaurantQueueStatusParams,
	IQueueService,
} from "@/application/ports/services/queue.service.port.ts";
import { env } from "@/config/env.ts";
import { QUEUE_SERVICE_ROUTES } from "@shared/constants/route.constants";

interface InternalActiveQueueResponse {
	success?: boolean;
	data?: {
		restaurantId: string;
		queueEntryId: string;
	} | null;
}

interface ActiveQueueData {
	restaurantId: string;
	queueEntryId: string;
}

@injectable()
export class QueueService implements IQueueService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey: string;
	private static readonly REQUEST_TIMEOUT_MS = 2500;

	constructor(
		baseUrl: string = env.QUEUE_SERVICE_URL,
		serviceName: string = env.S2S_AUDIENCE || "restaurant-service",
		targetServiceName: string = env.QUEUE_SERVICE_NAME || "queue-service",
		privateKey?: string,
	) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.serviceName = serviceName;
		this.targetServiceName = targetServiceName;
		this.privateKey = privateKey ?? env.S2S_PRIVATE_KEY;
	}

	private getInternalHeaders(): Record<string, string> {
		const issuerConfig: TokenIssuerConfig = {
			serviceName: this.serviceName,
			privateKey: this.privateKey,
		};
		const token = generateToken(this.targetServiceName, issuerConfig);

		return {
			Accept: "application/json",
			"X-Caller-Service": this.serviceName,
			Authorization: `Bearer ${token}`,
		};
	}

	private getUnavailableStatus(
		isGuestUser = false,
	): CustomerRestaurantQueueStatusDTO {
		return {
			isGuestUser,
			hasJoinedAnyQueue: null,
			hasJoinedThisRestaurantQueue: null,
			isQueueStatusAvailable: false,
		};
	}

	private isActiveQueueData(data: unknown): data is ActiveQueueData {
		if (!data || typeof data !== "object") {
			return false;
		}

		const queue = data as Partial<ActiveQueueData>;
		return (
			typeof queue.restaurantId === "string" &&
			typeof queue.queueEntryId === "string"
		);
	}

	private async fetchQueueStatus(userId: string): Promise<unknown> {
		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			QueueService.REQUEST_TIMEOUT_MS,
		);

		try {
			const url = `${this.baseUrl}${QUEUE_SERVICE_ROUTES.CUSTOMER_STATUS(userId)}`;
			const response = await fetch(url, {
				method: "GET",
				headers: this.getInternalHeaders(),
				signal: controller.signal,
			});

			if (!response.ok) {
				return null;
			}

			return await response.json();
		} finally {
			clearTimeout(timeoutId);
		}
	}

	public async getQueueStatus(
		params: GetRestaurantQueueStatusParams,
	): Promise<CustomerRestaurantQueueStatusDTO | null> {
		const { restaurantId, userId } = params;
		if (!userId) {
			return this.getUnavailableStatus(true);
		}

		try {
			const payload: unknown = await this.fetchQueueStatus(userId);
			if (!this.isSuccessfulResponse(payload)) {
				return this.getUnavailableStatus();
			}

			const queueData = payload.data;
			if (queueData !== null && !this.isActiveQueueData(queueData)) {
				return this.getUnavailableStatus();
			}

			return this.toQueueStatus(queueData, restaurantId);
		} catch {
			return this.getUnavailableStatus();
		}
	}

	private isSuccessfulResponse(
		payload: unknown,
	): payload is InternalActiveQueueResponse & {
		success: true;
		data: ActiveQueueData | null;
	} {
		return (
			payload !== null &&
			typeof payload === "object" &&
			(payload as InternalActiveQueueResponse).success === true &&
			"data" in payload
		);
	}

	private toQueueStatus(
		queueData: ActiveQueueData | null,
		restaurantId: string,
	): CustomerRestaurantQueueStatusDTO {
		return {
			isGuestUser: false,
			hasJoinedAnyQueue: queueData !== null,
			hasJoinedThisRestaurantQueue: queueData?.restaurantId === restaurantId,
			isQueueStatusAvailable: true,
		};
	}
}
