export const messages = {
	// Success Messages
	SUCCESS: "Success",
	STAFF_LOGIN_SUCCESS: "Staff logged in successfully",
	STAFF_LOGOUT_SUCCESS: "Staff logged out successfully",
	STAFF_TOKEN_REFRESH_SUCCESS: "Access token refreshed successfully",
	OTP_SENT_SUCCESS: "OTP sent to your email successfully",
	OTP_VERIFIED_SUCCESS: "OTP verified successfully",
	OTP_RESENT_SUCCESS: "OTP resent to your email successfully",
	PASSWORD_RESET_SUCCESS: "Password reset successfully",
	SERVICE_RUNNING: "Service is running",
	SERVICE_HEALTHY: "Service health check successful",
	SERVICE_READY: "Service is ready",

	// Error Messages
	INTERNAL_SERVER_ERROR: "Internal server error occurred",
	UNHANDLED_APP_ERROR: "Unhandled application error",
	UNAUTHORIZED: "Unauthorized access",
	FORBIDDEN: "Forbidden request",
	VALIDATION_ERROR: "Validation error occurred",
	INVALID_CREDENTIALS: "Invalid email or password",
	INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
	REVOKED_TOKEN: "Refresh token has been revoked",
	INVALID_OTP: "Invalid or incorrect OTP",
	OTP_EXPIRED: "OTP has expired. Please request a new one",
	INVALID_TEMP_TOKEN: "Invalid or expired reset token",
	RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
	RATE_LIMIT_LOGIN_EXCEEDED:
		"Too many login attempts. Please try again after 15 minutes.",
	RATE_LIMIT_FORGOT_PASSWORD_EXCEEDED:
		"Too many forgot password requests for this email. Maximum 3 attempts per 24 hours.",
	RATE_LIMIT_VERIFY_OTP_EXCEEDED:
		"Too many failed OTP verification attempts. Please try again after 15 minutes.",
	RATE_LIMIT_RESEND_OTP_EXCEEDED:
		"Too many OTP resend requests. Maximum 3 attempts per 1 hour.",
	RATE_LIMIT_RESET_PASSWORD_EXCEEDED:
		"Too many password reset attempts. Please try again after 15 minutes.",
	RATE_LIMIT_REFRESH_TOKEN_EXCEEDED:
		"Too many token refresh requests. Please try again after 1 minute.",
	STAFF_NOT_FOUND: "Staff member not found",
	STAFF_INACTIVE: "Staff account is inactive. Please contact administrator",
	STAFF_SUSPENDED: "Staff account is suspended. Please contact administrator",
	EMAIL_ALREADY_EXISTS: "Staff member with this email already exists",
	SERVICE_UNAVAILABLE: "Service temporarily unavailable",
	REQ_ROUTE_NOT_FOUND: "Requested route not found",

	// Logging Messages
	INCOMMING_HTTP_REQ: "Incoming HTTP Request",
	OUTGOING_HTTP_RES: "Outgoing HTTP Response",
} as const;

export type MessageKey = keyof typeof messages;
