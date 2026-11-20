export interface IEmailService {
	sendVerificationEmail(toEmail: string, otp: string): Promise<void>;
}
