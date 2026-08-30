export interface VerificationOtpTemplateProps {
	otp: string;
	validityMinutes?: number;
}

export interface RenderedEmailTemplate {
	subject: string;
	htmlContent: string;
}

export function renderVerificationOtpTemplate(
	props: VerificationOtpTemplateProps,
): RenderedEmailTemplate {
	const validityMinutes = props.validityMinutes ?? 5;

	return {
		subject: "SpotQ - Verify Your Email Address",
		htmlContent: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SpotQ - Email Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
                <tr>
                <td align="center">
                    <table role="presentation" width="100%" max-width="560" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
                    <!-- Header / Brand -->
                    <tr>
                        <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">Spot<span style="color: #6366f1;">Q</span></h1>
                        <p style="margin: 4px 0 0; font-size: 13px; font-weight: 500; color: #64748b; letter-spacing: 0.5px;">Experience the new way of dining!</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 36px 40px 32px;">
                        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">Verify your email address</h2>
                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 24px; color: #475569; text-align: center;">
                            To complete your forgot-password verification, please use the following one-time verification code:
                        </p>

                        <!-- OTP Code Box -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
                            <tr>
                            <td align="center">
                                <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px 36px;">
                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${props.otp}</span>
                                </div>
                            </td>
                            </tr>
                        </table>

                        <!-- Security Info -->
                        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px; padding: 14px 18px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569;">
                            ⏰ This code will expire in <strong>${validityMinutes} minutes</strong> and can only be used once.
                            </p>
                        </div>

                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #94a3b8; text-align: center;">
                            If you did not attempt to forgot password on SpotQ, you can safely ignore this email.
                        </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                        <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
                            © ${new Date().getFullYear()} SpotQ Technologies. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                            This is an automated transactional message. Please do not reply directly to this email.
                        </p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </body>
            </html>
		`.trim(),
	};
}
