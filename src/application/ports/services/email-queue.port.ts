export interface SendVerificationOtpJobData {
	to: string;
	otp: string;
	recipientName?: string;
	validityMinutes?: number;
}

export interface IEmailQueuePort {
	sendVerificationOtp(data: SendVerificationOtpJobData): Promise<void>;
}
