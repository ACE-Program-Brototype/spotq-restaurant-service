export interface VerifyForgotPasswordOtpDTO {
	email: string;
	otp: string;
}

export interface VerifyForgotPasswordOtpResponseDTO {
	tempToken: string;
}
