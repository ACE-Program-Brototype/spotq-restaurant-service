export interface SendVerificationOtpJobData {
	to: string;
	otp: string;
	recipientName?: string;
	validityMinutes?: number;
}

export interface SendStaffInvitationJobData {
	to: string;
	invitationUrl: string;
	restaurantName: string;
	validityHours?: number;
	recipientName?: string;
}

export interface IEmailQueuePort {
	sendVerificationOtp(data: SendVerificationOtpJobData): Promise<void>;
	sendStaffInvitation(data: SendStaffInvitationJobData): Promise<void>;
}
