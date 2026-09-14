import type { Queue } from "bullmq";
import { inject, injectable } from "inversify";
import type {
	IEmailQueuePort,
	SendStaffInvitationJobData,
	SendVerificationOtpJobData,
} from "@/application/ports/services/email-queue.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { emailQueue } from "@/infrastructure/queue/bullmq.service.ts";
import {
	renderStaffInvitationTemplate,
	renderVerificationOtpTemplate,
} from "@/infrastructure/template/email.template";
import { JOB_NAMES, QUEUE_NAMES } from "@/shared/constants/queue.constants.ts";

export const EMAIL_QUEUE_NAME = QUEUE_NAMES.EMAIL;

export interface SendEmailJobPayload {
	to: string;
	subject: string;
	htmlContent: string;
	recipientName?: string;
}

export { emailQueue };

@injectable()
export class EmailQueueService implements IEmailQueuePort {
	constructor(
		@inject(TYPES.Queue.Email)
		private readonly queue: Queue = emailQueue,
	) {}

	public async sendVerificationOtp(
		data: SendVerificationOtpJobData,
	): Promise<void> {
		const rendered = renderVerificationOtpTemplate({
			otp: data.otp,
			validityMinutes: data.validityMinutes ?? 5,
		});

		await this.queue.add(JOB_NAMES.EMAIL.TRANSACTIONAL, {
			to: data.to,
			subject: rendered.subject,
			htmlContent: rendered.htmlContent,
			recipientName: data.recipientName,
		});
	}

	public async sendStaffInvitation(
		data: SendStaffInvitationJobData,
	): Promise<void> {
		const rendered = renderStaffInvitationTemplate({
			restaurantName: data.restaurantName,
			invitationUrl: data.invitationUrl,
			validityHours: data.validityHours,
		});

		await this.queue.add(JOB_NAMES.EMAIL.TRANSACTIONAL, {
			to: data.to,
			subject: rendered.subject,
			htmlContent: rendered.htmlContent,
			recipientName: data.recipientName,
		});
	}
}
