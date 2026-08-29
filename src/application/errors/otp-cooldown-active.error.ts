export class OtpCooldownActiveError extends Error {
	constructor() {
		super("Please wait before requesting another OTP");
		this.name = "OtpCooldownActiveError";
	}
}