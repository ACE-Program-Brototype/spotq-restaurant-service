export class OtpVerificationAttemptsExceededError extends Error {
	constructor() {
		super("Maximum OTP verification attempts exceeded");
		this.name = "OtpVerificationAttemptsExceededError";
	}
}