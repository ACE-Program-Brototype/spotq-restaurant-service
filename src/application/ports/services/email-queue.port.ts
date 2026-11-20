export interface SendVerificationOtpJobData {
	to: string;
	otp: string;
	recipientName?: string;
	validityMinutes?: number;
}

export interface SendSubscriptionActivatedEmailJobData {
	to: string;
	ownerName: string;
	restaurantName: string;
	planCode: string;
	subscriptionEndsAt: Date | string;
	eventId?: string;
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
	sendSubscriptionActivatedEmail(
		data: SendSubscriptionActivatedEmailJobData,
	): Promise<void>;
	sendStaffInvitation(data: SendStaffInvitationJobData): Promise<void>;
}
