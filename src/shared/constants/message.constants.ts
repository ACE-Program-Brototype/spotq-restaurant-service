export const messages = {
	SUCCESS: "Success",
	LOGIN_SUCCESS: "Login successful",
	LOGOUT_SUCCESS: "Logout successful",
	STAFF_LOGIN_SUCCESS: "Staff logged in successfully",
	STAFF_LOGOUT_SUCCESS: "Staff logged out successfully",
	STAFF_TOKEN_REFRESH_SUCCESS: "Access token refreshed successfully",
	ACCESS_TOKEN_REFRESH_SUCCESS: "Access token refreshed successfully",
	FORGOT_PASSWORD_OTP_SENT: "Password reset OTP sent to your email",
	OTP_SENT_SUCCESS: "OTP sent to your email successfully",
	OTP_VERIFIED_SUCCESS: "OTP verified successfully",
	OTP_RESENT_SUCCESS: "OTP resent to your email successfully",
	PASSWORD_RESET_SUCCESS: "Password reset successfully",
	RESTAURANT_STATUS_FETCHED: "Restaurant status retrieved successfully",

	STAFF_INVITATION_SENT_SUCCESS: "Staff invitation sent successfully",
	STAFF_INVITATION_VALID: "Invitation token is valid",
	STAFF_INVITATION_ACCEPTED_SUCCESS:
		"Staff account created and invitation accepted successfully",
	STAFF_INVITATION_RESENT_SUCCESS: "Staff invitation resent successfully",
	STAFF_INVITATION_REVOKED_SUCCESS: "Staff invitation revoked successfully",
	STAFF_INVITATIONS_FETCHED_SUCCESS: "Staff invitations retrieved successfully",
	STAFF_PROFILE_FETCH_SUCCESS: "Staff profile retrieved successfully",

	PRESIGNED_URL_GENERATED_SUCCESS:
		"Presigned upload URL generated successfully.",
	PRESIGNED_GET_URL_GENERATED_SUCCESS:
		"Presigned download URL generated successfully.",

	SERVICE_RUNNING: "Service is running",
	SERVICE_HEALTHY: "Service health check successful",
	SERVICE_READY: "Service is ready",

	INTERNAL_SERVER_ERROR: "Internal server error occurred",
	UNHANDLED_APP_ERROR: "Unhandled application error",
	UNAUTHORIZED: "Unauthorized access",
	UNAUTHORIZED_RESTAURANT: "Unauthorized or missing restaurant identification",
	GATEWAY_UNAUTHORIZED: "Unauthorized request from gateway",
	AUTH_HEADER_REQUIRED: "Authorization header with Bearer token is required",
	INVALID_ACCESS_TOKEN: "Invalid or expired access token",
	FORBIDDEN: "Forbidden request",
	STAFF_FORBIDDEN: "Forbidden: Staff access required",
	VALIDATION_ERROR: "Validation error occurred",
	INVALID_CREDENTIALS: "Invalid email or password",
	INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
	REVOKED_TOKEN: "Refresh token has been revoked",
	INVALID_OTP: "Invalid or incorrect OTP",
	OTP_EXPIRED: "OTP has expired. Please request a new one",
	INVALID_TEMP_TOKEN: "Invalid or expired reset token",
	EMAIL_NOT_VERIFIED: "Email address is not verified",
	ACCOUNT_NOT_ACTIVE: "Your account is not active. Please contact support",
	ACCOUNT_LOCKED:
		"Too many failed login attempts. Please reset your password or try again later",
	TOO_MANY_REQUESTS: "Too many requests. Please try again later",
	UNKNOWN_ERROR: "An unexpected error occurred",
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
	RATE_LIMIT_INVITE_STAFF_EXCEEDED:
		"Too many staff invitation requests. Please try again later.",
	RATE_LIMIT_REVOKE_INVITATION_EXCEEDED:
		"Too many invitation revocation attempts. Please try again later.",
	RATE_LIMIT_VALIDATE_INVITATION_EXCEEDED:
		"Too many invitation validation attempts. Please try again later.",
	RATE_LIMIT_ACCEPT_INVITATION_EXCEEDED:
		"Too many invitation acceptance attempts. Please try again later.",
	STAFF_NOT_FOUND: "Staff member not found",
	STAFF_INACTIVE: "Staff account is inactive. Please contact administrator",
	STAFF_SUSPENDED: "Staff account is suspended. Please contact administrator",
	STAFF_ACCOUNT_NOT_ACTIVE: "Staff account is not active",
	STAFF_ACCOUNT_SUSPENDED: "Staff account is suspended",
	EMAIL_ALREADY_EXISTS: "Staff member with this email already exists",
	STAFF_INVITATION_ALREADY_PENDING:
		"An active invitation has already been sent to this email address",
	STAFF_INVITATION_NOT_FOUND: "Staff invitation not found",
	CANNOT_RENEW_ACCEPTED_INVITATION:
		"Cannot renew an already accepted invitation",
	INVALID_INVITATION_TOKEN: "Invalid or non-existent invitation token",
	INVITATION_EXPIRED: "Invitation has expired",
	INVALID_STAFF_DATA: "Invalid staff data provided",
	INVALID_RESTAURANT_DATA: "Invalid restaurant data provided",
	RESTAURANT_NOT_FOUND: "Restaurant not found",
	RESTAURANT_ID_REQUIRED: "Restaurant ID is required",
	RESTAURANT_ACCOUNT_BLOCKED:
		"Restaurant account is blocked. Please contact support",
	RESTAURANT_INACTIVE:
		"Restaurant is not active or approved to perform this action",
	TOKEN_HASH_REQUIRED: "Token hash is required",
	PASSWORD_HASH_REQUIRED: "Password hash is required",
	FULLNAME_INVALID: "Fullname is required and must be at least 2 characters",
	FULLNAME_REQUIRED: "Fullname is required",
	RESTAURANT_NAME_INVALID:
		"Restaurant name is required and must be at least 2 characters",
	RESTAURANT_EMAIL_REQUIRED: "Valid restaurant email is required",
	RESTAURANT_PHONE_REQUIRED: "Valid restaurant phone is required",
	OWNER_NAME_INVALID:
		"Owner name is required and must be at least 2 characters",
	OWNER_EMAIL_REQUIRED: "Valid owner email is required",
	PHONE_REQUIRED: "Phone number is required",
	INVALID_PHONE_FORMAT: "Invalid phone number format",
	EMAIL_REQUIRED: "Email is required",
	INVALID_EMAIL_FORMAT: "Invalid email format",
	INVALID_STAFF_ROLE: "Invalid staff role specified",
	INVALID_STAFF_STATUS: "Invalid staff status specified",
	INVALID_INVITATION_STATUS: "Invalid invitation status specified",
	INVALID_RESTAURANT_STATUS: "Invalid restaurant status specified",
	INVALID_ONBOARDING_STATUS: "Invalid onboarding status specified",
	BLOCK_REASON_REQUIRED: "Block reason is required",
	RESET_TOKEN_REQUIRED: "Reset token is required",
	INVALID_TOKEN_PURPOSE: "Invalid token purpose",
	REFRESH_TOKEN_REQUIRED: "Refresh token is required",
	INVITATION_TOKEN_REQUIRED: "Invitation token is required",
	FULLNAME_MIN_LENGTH: "Full name must be at least 2 characters",
	FULLNAME_MAX_LENGTH: "Full name must not exceed 100 characters",
	INVALID_INDIAN_PHONE_FORMAT:
		"Invalid Indian phone number format. Must be a 10-digit mobile number starting with 6-9, optionally prefixed with +91, 91, or 0",
	PASSWORD_REQUIRED: "Password is required",
	PASSWORD_MIN_LENGTH: "Password must be at least 8 characters long",
	PASSWORD_MIN_LENGTH_6: "Password must be at least 6 characters",
	PASSWORD_UPPERCASE_REQUIRED:
		"Password must contain at least one uppercase letter",
	PASSWORD_LOWERCASE_REQUIRED:
		"Password must contain at least one lowercase letter",
	PASSWORD_DIGIT_REQUIRED: "Password must contain at least one digit",
	PASSWORD_SPECIAL_REQUIRED:
		"Password must contain at least one special character",
	EITHER_INVITATION_ID_OR_EMAIL_REQUIRED:
		"Either invitationId or email must be provided",
	OTP_REQUIRED: "OTP is required",
	OTP_DIGITS_REQUIRED: "OTP must be a 6-digit number",
	SERVICE_UNAVAILABLE: "Service temporarily unavailable",
	ROUTE_NOT_FOUND: "The requested route does not exist",
	REQ_ROUTE_NOT_FOUND: "Requested route not found",

	INCOMMING_HTTP_REQ: "Incoming HTTP Request",
	OUTGOING_HTTP_RES: "Outgoing HTTP Response",

	RESTAURANT_EMAIL_OTP_SENT_SUCCESS:
		"If this email is eligible for registration, a verification code will be sent.",
	EMAIL_VERIFIED_SUCCESS: "Email verified successfully.",
	RESTAURANT_REGISTRATION_SUCCESS: "Restaurant registered successfully.",
} as const;

export type MessageKey = keyof typeof messages;
