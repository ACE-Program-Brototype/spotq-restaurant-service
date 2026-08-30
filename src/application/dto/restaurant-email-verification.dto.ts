export interface SendRestaurantEmailOtpDto {
	email: string;
}

export interface VerifyRestaurantEmailOtpDto {
	email: string;
	otp: string;
}

export interface VerifyRestaurantEmailOtpResponseDto {
	nextStep: "ONBOARDING" | "DASHBOARD";
	verificationToken?: string;
	accessToken?: string;
	refreshToken?: string;
}
