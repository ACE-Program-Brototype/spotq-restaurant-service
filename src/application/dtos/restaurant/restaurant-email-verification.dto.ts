export interface SendRestaurantEmailOtpDto {
	email: string;
}

export interface VerifyRestaurantEmailOtpDto {
	email: string;
	otp: string;
}

export interface VerifyRestaurantEmailOtpResponseDto {
	nextStep: "ONBOARDING" | "VERIFICATION_STATUS" | "SUBSCRIPTION" | "DASHBOARD";
	restaurantId: string;
	accessToken: string;
	refreshToken: string;
}
