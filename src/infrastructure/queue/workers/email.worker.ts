import type { BrevoClient } from "@getbrevo/brevo";
import { type Job, Worker } from "bullmq";
import { inject, injectable } from "inversify";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { TYPES } from "@/config/di/types";
import { env } from "@/config/env.ts";
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

	start(): void {
		this.worker = new Worker(
			QUEUE_NAMES.EMAIL,
			async (job: Job) => {
				this.logger.info(
					{
						jobId: job.id,
						jobName: job.name,
						event: "EMAIL_JOB_PROCESSING",
					},
					"Processing email job",
				);

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
						{ jobId: job.id, jobName: job.name },
						"Unknown email job type received",
					);
				}

				this.logger.info(
					{
						jobId: job.id,
						jobName: job.name,
						event: "EMAIL_JOB_COMPLETED",
					},
					"Email job completed successfully",
				);
			},
			{
				connection: bullMQConnection,
				concurrency: env.BULLMQ_WORKER_CONCURRENCY ?? 5,
			},
		);

		this.worker.on("failed", (job, err) => {
			this.logger.error(
				{
					event: "EMAIL_WORKER_JOB_FAILED",
					jobId: job?.id,
					jobName: job?.name,
					error: err.message,
				},
				"Email job processing failed",
			);
		});

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
