import { DomainError } from "./domain.error.js";

export class InvalidStaffDataError extends DomainError {
	public readonly code = "INVALID_STAFF_DATA";
	constructor(message = "Invalid staff data provided", details?: unknown) {
		super(message, details);
	}
}

export class StaffNotFoundError extends DomainError {
	public readonly code = "STAFF_NOT_FOUND";
	constructor(message = "Staff member not found") {
		super(message);
	}
}

export class StaffAlreadyExistsError extends DomainError {
	public readonly code = "EMAIL_ALREADY_EXISTS";
	constructor(message = "Staff member with this email already exists") {
		super(message);
	}
}

export class InvalidCredentialsError extends DomainError {
	public readonly code = "INVALID_CREDENTIALS";
	constructor(message = "Invalid email or password") {
		super(message);
	}
}

export class InvalidRefreshTokenError extends DomainError {
	public readonly code = "INVALID_REFRESH_TOKEN";
	constructor(message = "Invalid or expired refresh token") {
		super(message);
	}
}

export class RevokedTokenError extends DomainError {
	public readonly code = "REVOKED_TOKEN";
	constructor(message = "Refresh token has been revoked") {
		super(message);
	}
}

export class InvalidOtpError extends DomainError {
	public readonly code = "INVALID_OTP";
	constructor(message = "Invalid or incorrect OTP") {
		super(message);
	}
}

export class OtpExpiredError extends DomainError {
	public readonly code = "OTP_EXPIRED";
	constructor(message = "OTP has expired. Please request a new one") {
		super(message);
	}
}

export class InvalidTempTokenError extends DomainError {
	public readonly code = "INVALID_TEMP_TOKEN";
	constructor(message = "Invalid or expired reset token") {
		super(message);
	}
}

export class RateLimitExceededError extends DomainError {
	public readonly code = "RATE_LIMIT_EXCEEDED";
	constructor(message = "Too many requests. Please try again later") {
		super(message);
	}
}

export class StaffInactiveError extends DomainError {
	public readonly code = "STAFF_INACTIVE";
	constructor(message = "Staff account is not active") {
		super(message);
	}
}

export class StaffSuspendedError extends DomainError {
	public readonly code = "STAFF_SUSPENDED";
	constructor(message = "Staff account is suspended") {
		super(message);
	}
}

export class InvalidEmailError extends DomainError {
	public readonly code = "INVALID_EMAIL";
	constructor(message = "Invalid email address provided") {
		super(message);
	}
}

export class InvalidPhoneError extends DomainError {
	public readonly code = "INVALID_PHONE";
	constructor(message = "Invalid phone number provided") {
		super(message);
	}
}

export class InvalidStaffRoleError extends DomainError {
	public readonly code = "INVALID_STAFF_ROLE";
	constructor(message = "Invalid staff role specified") {
		super(message);
	}
}

export class InvalidStaffStatusError extends DomainError {
	public readonly code = "INVALID_STAFF_STATUS";
	constructor(message = "Invalid staff status specified") {
		super(message);
	}
}
