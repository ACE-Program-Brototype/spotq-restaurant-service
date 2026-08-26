import type { IEmailService } from "@/application/ports/services/email-service.interface";
import type { ILogger } from "@/application/ports/services/logger.interface";
import { env } from "@/config/env";
import { TYPES } from "@/di/types";
import { renderVerificationOtpTemplate } from "@/infrastructure/template/email.template";
import type { BrevoClient } from "@getbrevo/brevo";
import { inject, injectable } from "inversify";

@injectable()
export class BrevoEmailService implements IEmailService {
	constructor(
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,

		@inject(TYPES.Brevo.Client)
		private readonly brevoClient: BrevoClient,
	) {}

	public async sendVerificationEmail(
		toEmail: string,
		otp: string,
	): Promise<void> {
		try {
			const { subject, htmlContent } = renderVerificationOtpTemplate({
				otp,
				validityMinutes: Math.floor(env.OTP_TTL_SECONDS / 60),
			});

			await this.brevoClient.transactionalEmails.sendTransacEmail({
				sender: {
					name: env.BREVO_SENDER_NAME,
					email: env.BREVO_SENDER_EMAIL,
				},
				to: [{ email: toEmail }],
				subject,
				htmlContent,
			});

			this.logger.info(
				{
					toEmail,
					event: "EMAIL_VERIFICATION_SENT",
				},
				"Verification email sent successfully via Brevo",
			);
		} catch (error) {
			this.logger.error(
				{
					err: error,
					toEmail,
					event: "EMAIL_DELIVERY_FAILED",
				},
				"Failed to deliver verification email via Brevo",
			);

			throw error;
		}
	}
}
