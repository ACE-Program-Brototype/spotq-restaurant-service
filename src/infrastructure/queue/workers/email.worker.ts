import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { TYPES } from "@/di/types";
import { Worker } from "bullmq";
import { inject, injectable } from "inversify";
import { bullMQConnection } from "../bullmq.service";
import { JOB_NAMES, QUEUE_NAMES } from "@/shared/constants/queue.constants";

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
