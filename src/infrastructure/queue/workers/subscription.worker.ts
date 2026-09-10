import { type Job, Worker } from "bullmq";
import type { IActivateSubscriptionUseCase } from "@/application/ports/use-cases/activate-subscription.use-case.port.ts";
import { env } from "@/config/env.ts";
import { container } from "@di/container.ts";
import { TYPES } from "@di/types.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { JOB_NAMES, QUEUE_NAMES } from "@/shared/constants/queue.constants";
import { bullMQConnection } from "../bullmq.service";

export interface SubscriptionActivatedJobPayload {
	eventId: string;
	subscriptionId: string;
	restaurantId: string;
	planCode: string;
	status: string;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	timestamp: string;
}

export const createSubscriptionWorker =
	(): Worker<SubscriptionActivatedJobPayload> => {
		const activateSubscriptionUseCase =
			container.get<IActivateSubscriptionUseCase>(
				TYPES.UseCases.ActivateSubscriptionUseCase,
			);

		const worker = new Worker<SubscriptionActivatedJobPayload>(
			QUEUE_NAMES.SUBSCRIPTION_EVENTS,
			async (job: Job<SubscriptionActivatedJobPayload>) => {
				if (job.name === JOB_NAMES.SUBSCRIPTION.ACTIVATED) {
					const {
						eventId,
						subscriptionId,
						restaurantId,
						planCode,
						currentPeriodEnd,
					} = job.data;

					logger.info(
						{
							jobId: job.id,
							eventId,
							restaurantId,
							planCode,
							event: "SUBSCRIPTION_JOB_PROCESSING",
						},
						"Processing subscription.activated event",
					);

					const processed = await activateSubscriptionUseCase.execute({
						eventId,
						subscriptionId,
						restaurantId,
						planCode,
						currentPeriodEnd,
					});

					if (!processed) {
						logger.info(
							{ eventId, restaurantId },
							"Subscription event already processed. Skipping idempotently.",
						);
						return;
					}

					logger.info(
						{
							subscriptionId,
							restaurantId,
							planCode,
							event: "SUBSCRIPTION_JOB_COMPLETED",
						},
						"Restaurant subscription activated and cached successfully",
					);
				}
			},
			{
				connection: bullMQConnection,
				concurrency: env.BULLMQ_WORKER_CONCURRENCY,
			},
		);

		worker.on("ready", () => {
			logger.info(
				{
					queue: QUEUE_NAMES.SUBSCRIPTION_EVENTS,
					event: "SUBSCRIPTION_WORKER_READY",
				},
				"Subscription worker is ready and listening for events",
			);
		});

		worker.on("active", (job) => {
			logger.info(
				{
					jobId: job.id,
					jobName: job.name,
					event: "SUBSCRIPTION_WORKER_ACTIVE",
				},
				"Subscription worker started processing job",
			);
		});

		worker.on("completed", (job) => {
			logger.info(
				{
					jobId: job.id,
					jobName: job.name,
					event: "SUBSCRIPTION_WORKER_JOB_COMPLETED",
				},
				"Subscription worker completed job",
			);
		});

		worker.on("failed", (job, err) => {
			logger.error(
				{
					event: "SUBSCRIPTION_WORKER_JOB_FAILED",
					jobId: job?.id,
					error: err.message,
				},
				"Subscription event job processing failed",
			);
		});

		worker.on("error", (err) => {
			logger.error(
				{
					event: "SUBSCRIPTION_WORKER_ERROR",
					error: err.message,
				},
				"Subscription worker encountered error",
			);
		});

		return worker;
	};
