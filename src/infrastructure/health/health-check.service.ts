import type { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import redis from "@/config/redis.ts";
import { testQueue } from "@/infrastructure/queue/bullmq.service.ts";

export interface HealthCheckResult {
	status: "ok" | "error";
	timestamp: string;
	services: {
		database: { status: "up" | "down"; latencyMs?: number; error?: string };
		redis: { status: "up" | "down"; latencyMs?: number; error?: string };
		bullmq: { status: "up" | "down"; latencyMs?: number; error?: string };
	};
}

export interface IHealthCheckable {
	checkHealth(): Promise<HealthCheckResult>;
	isReady(): Promise<boolean>;
}

@injectable()
export class HealthCheckService implements IHealthCheckable {
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	public async isReady(): Promise<boolean> {
		try {
			await Promise.all([
				this.prisma.$queryRaw`SELECT 1`,
				redis.ping(),
				testQueue.waitUntilReady(),
			]);
			return true;
		} catch {
			return false;
		}
	}

	public async checkHealth(): Promise<HealthCheckResult> {
		const timestamp = new Date().toISOString();
		const result: HealthCheckResult = {
			status: "ok",
			timestamp,
			services: {
				database: { status: "down" },
				redis: { status: "down" },
				bullmq: { status: "down" },
			},
		};

		// Database Check
		try {
			const dbStart = Date.now();
			await this.prisma.$queryRaw`SELECT 1`;
			result.services.database = {
				status: "up",
				latencyMs: Date.now() - dbStart,
			};
		} catch (error) {
			result.status = "error";
			result.services.database = {
				status: "down",
				error: error instanceof Error ? error.message : "Unknown DB error",
			};
		}

		// Redis Check
		try {
			const redisStart = Date.now();
			await redis.ping();
			result.services.redis = {
				status: "up",
				latencyMs: Date.now() - redisStart,
			};
		} catch (error) {
			result.status = "error";
			result.services.redis = {
				status: "down",
				error: error instanceof Error ? error.message : "Unknown Redis error",
			};
		}

		// BullMQ Check
		try {
			const bmqStart = Date.now();
			await testQueue.waitUntilReady();
			result.services.bullmq = {
				status: "up",
				latencyMs: Date.now() - bmqStart,
			};
		} catch (error) {
			result.status = "error";
			result.services.bullmq = {
				status: "down",
				error: error instanceof Error ? error.message : "Unknown BullMQ error",
			};
		}

		return result;
	}
}
