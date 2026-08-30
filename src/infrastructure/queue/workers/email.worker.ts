import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { TYPES } from "@/di/types";
import { Worker,Job } from "bullmq";
import { inject, injectable } from "inversify";
import { bullMQConnection } from "../bullmq.service";
import { JOB_NAMES, QUEUE_NAMES } from "@/shared/constants/queue.constants";
import { brevoClient } from "@/config/brevo.client.ts";
import { env } from "@/config/env.ts";
import redis from "@/config/redis.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import {
	EMAIL_QUEUE_NAME,
	type SendEmailJobPayload,
} from "@/infrastructure/queue/email.queue.ts";

@injectable()
export class EmailWorker implements IEmailWorker {
	private worker?: Worker;

	constructor(
		@inject(TYPES.Services.Brevo_Email)
		private readonly emailService: IEmailService,

		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	start(): void {
		this.worker = new Worker(
			QUEUE_NAMES.EMAIL,
			async (job) => {
				if (job.name === JOB_NAMES.EMAIL.VERIFICATION_OTP) {
					const { toEmail, otp } = job.data;

					this.logger.info(
						{
							jobId: job.id,
							jobName: job.name,
							toEmail,
							event: "EMAIL_JOB_PROCESSING",
						},
						"Processing email verification job",
					);

					await this.emailService.sendVerificationEmail(toEmail, otp);

					this.logger.info(
						{
							jobId: job.id,
							jobName: job.name,
							toEmail,
							event: "EMAIL_JOB_COMPLETED",
						},
						"Email verification job completed successfully",
					);
				}
			},
			{
				connection: bullMQConnection,
			},
		);

		this.logger.info(
			{
				queue: QUEUE_NAMES.EMAIL,
				event: "EMAIL_WORKER_STARTED",
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
					queue: QUEUE_NAMES.EMAIL,
					event: "EMAIL_WORKER_STOPPED",
				},
				"Email worker stopped successfully",
			);
		}
	}
}

export const createEmailWorker = (): Worker<SendEmailJobPayload> => {
	const worker = new Worker<SendEmailJobPayload>(
		EMAIL_QUEUE_NAME,
		async (job: Job<SendEmailJobPayload>) => {
			const { to, subject, htmlContent, recipientName } = job.data;

			try {
				await brevoClient.transactionalEmails.sendTransacEmail({
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

				logger.info(
					{
						event: "email.sent",
						to,
						subject,
						jobId: job.id,
					},
					"Transactional email sent successfully",
				);
			} catch (error) {
				logger.error(
					{
						event: "email.send_failed",
						to,
						subject,
						jobId: job.id,
						error,
					},
					"Failed to send transactional email via Brevo",
				);
				throw error;
			}
		},
		{
			connection: redis,
			concurrency: 5,
		},
	);

	worker.on("failed", (job, err) => {
		logger.error(
			{
				event: "email.worker_job_failed",
				jobId: job?.id,
				error: err.message,
			},
			"Email job processing failed permanently",
		);
	});

	return worker;
};
