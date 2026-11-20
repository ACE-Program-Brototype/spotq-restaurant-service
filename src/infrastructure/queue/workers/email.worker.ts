import crypto from "node:crypto";
import type { BrevoClient } from "@getbrevo/brevo";
import { type Job, Worker } from "bullmq";
import { inject, injectable } from "inversify";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { TYPES } from "@/config/di/types";
import { env } from "@/config/env.ts";
import { requestContextStorage } from "@/infrastructure/observability/async-storage.ts";
import { JOB_NAMES, QUEUE_NAMES } from "@/shared/constants/queue.constants";
import { bullMQConnection } from "../bullmq.service";

@injectable()
export class EmailWorker implements IEmailWorker {
	private worker?: Worker;

	constructor(
		@inject(TYPES.Services.Brevo_Email)
		private readonly emailService: IEmailService,

		@inject(TYPES.Brevo.Client)
		private readonly brevoClient: BrevoClient,

		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	async processJob(job: Job): Promise<void> {
		const correlationId =
			(job.data?.correlationId as string) ||
			(job.data?.correlation_id as string) ||
			String(job.id || crypto.randomUUID());

		await requestContextStorage.run(
			{ correlationId, requestId: correlationId },
			async () => {
				const startTime = process.hrtime.bigint();
				this.logger.info(
					{
						job: {
							queue: QUEUE_NAMES.EMAIL,
							job_id: String(job.id),
							routing_key: job.name,
							status: "PROCESSING",
						},
					},
					"Processing email job",
				);

				try {
					if (job.name === JOB_NAMES.EMAIL.VERIFICATION_OTP) {
						const { toEmail, otp } = job.data;
						await this.emailService.sendVerificationEmail(toEmail, otp);
					} else if (job.name === JOB_NAMES.EMAIL.TRANSACTIONAL) {
						const { to, subject, htmlContent, recipientName } = job.data;
						await this.brevoClient.transactionalEmails.sendTransacEmail({
							subject,
							htmlContent,
							sender: {
								name: env.BREVO_SENDER_NAME,
								email: env.BREVO_SENDER_EMAIL,
							},
							to: [
								{
									email: to,
									name: recipientName,
								},
							],
						});
					} else {
						this.logger.warn(
							{
								job: {
									queue: QUEUE_NAMES.EMAIL,
									job_id: String(job.id),
									routing_key: job.name,
									status: "UNKNOWN",
								},
							},
							"Unknown email job type received",
						);
					}

					const endTime = process.hrtime.bigint();
					const durationMs =
						Math.round((Number(endTime - startTime) / 1_000_000) * 10) / 10;
					this.logger.info(
						{
							job: {
								queue: QUEUE_NAMES.EMAIL,
								job_id: String(job.id),
								routing_key: job.name,
								duration_ms: durationMs,
								status: "COMPLETED",
							},
						},
						"Email job completed successfully",
					);
				} catch (error) {
					const endTime = process.hrtime.bigint();
					const durationMs =
						Math.round((Number(endTime - startTime) / 1_000_000) * 10) / 10;
					this.logger.error(
						{
							err: error,
							job: {
								queue: QUEUE_NAMES.EMAIL,
								job_id: String(job.id),
								routing_key: job.name,
								duration_ms: durationMs,
								status: "FAILED",
							},
						},
						"Email job processing failed",
					);
					throw error;
				}
			},
		);
	}

	start(): void {
		this.worker = new Worker(
			QUEUE_NAMES.EMAIL,
			(job: Job) => this.processJob(job),
			{
				connection: bullMQConnection,
				concurrency: env.BULLMQ_WORKER_CONCURRENCY ?? 5,
			},
		);

		this.worker.on("failed", (job, err) => {
			this.logger.error(
				{
					err,
					job: {
						queue: QUEUE_NAMES.EMAIL,
						job_id: String(job?.id),
						routing_key: job?.name,
						status: "FAILED",
					},
				},
				"Email job processing failed",
			);
		});

		this.logger.info(
			{
				job: {
					queue: QUEUE_NAMES.EMAIL,
					status: "STARTED",
				},
			},
			"Email worker started successfully",
		);
	}

	async stop(): Promise<void> {
		if (this.worker) {
			await this.worker.close();
			this.worker = undefined;

			this.logger.info(
				{
					job: {
						queue: QUEUE_NAMES.EMAIL,
						status: "STOPPED",
					},
				},
				"Email worker stopped successfully",
			);
		}
	}
}
