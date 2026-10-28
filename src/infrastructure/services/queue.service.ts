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
	data?: {
		hasActiveQueue: boolean;
		queueEntry: {
			queueEntryId: string;
			restaurantId: string;
			userId: string | null;
			queueNumber: string;
			partySize: number;
			status: string;
			position: number | null;
			estimatedWaitMinutes: number | null;
			joinedAt: string | Date;
		} | null;
	};
	message?: string;
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
		const headers: Record<string, string> = {
			Accept: "application/json",
			"x-caller-service": this.serviceName,
		};

		if (this.privateKey) {
			try {
				const issuerConfig: TokenIssuerConfig = {
					serviceName: this.serviceName,
					privateKey: this.privateKey,
				};
				const token = generateToken(this.targetServiceName, issuerConfig);
				headers.Authorization = `Bearer ${token}`;
			} catch {
				// S2S token generation failure logged silently to avoid crashing caller
			}
		}

		return headers;
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

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				QueueService.REQUEST_TIMEOUT_MS,
			);

			const url = `${this.baseUrl}/api/internal/v1/restaurants/${encodeURIComponent(restaurantId)}/queue/users/${encodeURIComponent(userId)}/active`;

			const response = await fetch(url, {
				method: "GET",
				headers: this.getInternalHeaders(),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				return {
					isOpen: true,
					activeWaiters: 0,
					estimatedWaitMinutes: 0,
					membership: null,
				};
			}

			const payload = (await response.json()) as InternalActiveQueueResponse;
			const queueData = payload.data;

			if (!queueData) {
				return {
					isOpen: true,
					activeWaiters: 0,
					estimatedWaitMinutes: 0,
					membership: null,
				};
			}

			let membership: CustomerRestaurantQueueMembershipDTO | null = null;
			if (queueData.hasActiveQueue && queueData.queueEntry) {
				const entry = queueData.queueEntry;
				membership = {
					hasActiveQueue: true,
					queueEntryId: entry.queueEntryId,
					queueNumber: entry.queueNumber,
					partySize: entry.partySize,
					status: entry.status,
					position: entry.position,
					estimatedWaitMinutes: entry.estimatedWaitMinutes,
					joinedAt: entry.joinedAt,
				};
			} else {
				membership = {
					hasActiveQueue: false,
					queueEntryId: null,
					queueNumber: null,
					partySize: null,
					status: null,
					position: null,
					estimatedWaitMinutes: null,
					joinedAt: null,
				};
			}

			return {
				isOpen: true,
				activeWaiters: membership?.position ?? 0,
				estimatedWaitMinutes: membership?.estimatedWaitMinutes ?? 0,
				membership,
			};
		} catch {
			return {
				isOpen: true,
				activeWaiters: 0,
				estimatedWaitMinutes: 0,
				membership: null,
			};
		}
	}
}
