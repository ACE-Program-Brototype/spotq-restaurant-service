import { Queue } from "bullmq";
import { injectable } from "inversify";
import type {
	IEmailQueuePort,
	SendVerificationOtpJobData,
} from "@/application/ports/services/email-queue.port.ts";
import redis from "@/config/redis.ts";
import { renderVerificationOtpTemplate } from "@/infrastructure/templates/email-template.ts";

export const EMAIL_QUEUE_NAME = "email-queue";

export interface SendEmailJobPayload {
	to: string;
	subject: string;
	htmlContent: string;
	recipientName?: string;
}

export const emailQueue = new Queue<SendEmailJobPayload>(EMAIL_QUEUE_NAME, {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
		removeOnComplete: true,
		removeOnFail: 1000,
	},
});

@injectable()
export class EmailQueueService implements IEmailQueuePort {
	private readonly queue = emailQueue;

	public async sendVerificationOtp(
		data: SendVerificationOtpJobData,
	): Promise<void> {
		const rendered = renderVerificationOtpTemplate({
			otp: data.otp,
			validityMinutes: data.validityMinutes ?? 5,
		});

		await this.queue.add("send-email", {
			to: data.to,
			subject: rendered.subject,
			htmlContent: rendered.htmlContent,
			recipientName: data.recipientName,
		});
	}
}
