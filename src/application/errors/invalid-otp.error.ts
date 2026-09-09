import { HTTP_STATUS } from "@/shared/constants/http.constants";

export class InvalidOtpError extends Error {
	public readonly statusCode = HTTP_STATUS.BAD_REQUEST;

	constructor(message = "Invalid or expired OTP code") {
		super(message);
		this.name = "InvalidOtpError";
	}
}
