export const messages = {
	// Success Messages
	SUCCESS: "Success",
	STAFF_LOGIN_SUCCESS: "Staff logged in successfully",
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
