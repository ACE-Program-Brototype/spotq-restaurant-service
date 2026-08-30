import { type Job, Worker } from "bullmq";
import { brevoClient } from "@/config/brevo.client.ts";
import { env } from "@/config/env.ts";
import redis from "@/config/redis.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import {
	EMAIL_QUEUE_NAME,
	type SendEmailJobPayload,
} from "@/infrastructure/queue/email.queue.ts";

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
