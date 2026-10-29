import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import { injectable } from "inversify";
import type {
	CustomerRestaurantQueueMembershipDTO,
	CustomerRestaurantQueueStatusDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import type {
	GetRestaurantQueueStatusParams,
	IQueueService,
} from "@/application/ports/services/queue.service.port.ts";
import { env } from "@/config/env.ts";

interface InternalActiveQueueResponse {
	success?: boolean;
	message?: string;
	data?: {
		restaurantId: string;
		queueEntryId: string;
	} | null;
	statusCode?: number;
}

@injectable()
export class QueueService implements IQueueService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey?: string;
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
		this.privateKey = privateKey ?? env.JWT_PRIVATE_KEY;
	}

	private getInternalHeaders(): Record<string, string> {
		if (!this.privateKey) {
			throw new Error(
				"Missing private key for service-to-service authentication",
			);
		}

		const issuerConfig: TokenIssuerConfig = {
			serviceName: this.serviceName,
			privateKey: this.privateKey,
		};

		const token = generateToken(this.targetServiceName, issuerConfig);

		return {
			Accept: "application/json",
			"x-caller-service": this.serviceName,
			Authorization: `Bearer ${token}`,
		};
	}

	private getUnavailableStatus(): CustomerRestaurantQueueStatusDTO {
		return {
			isOpen: true,
			activeWaiters: 0,
			estimatedWaitMinutes: 0,
			membership: null,
		};
	}

	public async getQueueStatus(
		params: GetRestaurantQueueStatusParams,
	): Promise<CustomerRestaurantQueueStatusDTO | null> {
		const { restaurantId, userId } = params;

		if (!userId) {
			return {
				isOpen: true,
				activeWaiters: 0,
				estimatedWaitMinutes: 0,
				membership: null,
			};
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			QueueService.REQUEST_TIMEOUT_MS,
		);

		try {
			const url = `${this.baseUrl}/api/internal/v1/queue-entries/${encodeURIComponent(userId)}/status`;

			const response = await fetch(url, {
				method: "GET",
				headers: this.getInternalHeaders(),
				signal: controller.signal,
			});

			if (!response.ok) {
				return this.getUnavailableStatus();
			}

			const payload = (await response.json()) as InternalActiveQueueResponse;

			if (
				!payload ||
				typeof payload !== "object" ||
				payload.success !== true ||
				payload.data === undefined
			) {
				return this.getUnavailableStatus();
			}

			const queueData = payload.data;

			if (queueData !== null) {
				if (
					typeof queueData !== "object" ||
					typeof queueData.restaurantId !== "string" ||
					typeof queueData.queueEntryId !== "string"
				) {
					return this.getUnavailableStatus();
				}
			}

			let membership: CustomerRestaurantQueueMembershipDTO;

			if (queueData) {
				membership = {
					hasActiveQueue: true,
					queueEntryId: queueData.queueEntryId,
					isCurrentRestaurantQueue:
						queueData.restaurantId === restaurantId,
				};
			} else {
				membership = {
					hasActiveQueue: false,
					queueEntryId: null,
					isCurrentRestaurantQueue: false,
				};
			}

			return {
				isOpen: true,
				activeWaiters: 0,
				estimatedWaitMinutes: 0,
				membership,
			};
		} catch {
			return this.getUnavailableStatus();
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
