import { messages } from "@/shared/constants/message.constants.ts";
import { DOMAIN_ERROR_CODES } from "../constants/error-code.constants.ts";
import { DomainError } from "./domain.error.ts";

export class InvalidStaffDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_STAFF_DATA;
	constructor(
		message: string = messages.INVALID_STAFF_DATA,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class StaffNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_NOT_FOUND;
	constructor(message: string = messages.STAFF_NOT_FOUND) {
		super(message);
	}
}

export class StaffAlreadyExistsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.EMAIL_ALREADY_EXISTS;
	constructor(message: string = messages.EMAIL_ALREADY_EXISTS) {
		super(message);
	}
}

export class InvalidCredentialsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_CREDENTIALS;
	constructor(message: string = messages.INVALID_CREDENTIALS) {
		super(message);
	}
}

export class InvalidRefreshTokenError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_REFRESH_TOKEN;
	constructor(message: string = messages.INVALID_REFRESH_TOKEN) {
		super(message);
	}
}

export class RevokedTokenError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.REVOKED_TOKEN;
	constructor(message: string = messages.REVOKED_TOKEN) {
		super(message);
	}
}

export class InvalidOtpError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_OTP;
	constructor(message: string = messages.INVALID_OTP) {
		super(message);
	}
}

export class OtpExpiredError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.OTP_EXPIRED;
	constructor(message: string = messages.OTP_EXPIRED) {
		super(message);
	}
}

export class InvalidTempTokenError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_TEMP_TOKEN;
	constructor(message: string = messages.INVALID_TEMP_TOKEN) {
		super(message);
	}
}

export class RateLimitExceededError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RATE_LIMIT_EXCEEDED;
	constructor(message: string = messages.RATE_LIMIT_EXCEEDED) {
		super(message);
	}
}

export class StaffInactiveError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_INACTIVE;
	constructor(message: string = messages.STAFF_ACCOUNT_NOT_ACTIVE) {
		super(message);
	}
}

export class StaffSuspendedError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_SUSPENDED;
	constructor(message: string = messages.STAFF_ACCOUNT_SUSPENDED) {
		super(message);
	}
}

export class StaffForbiddenError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_FORBIDDEN;
	constructor(message: string = messages.STAFF_FORBIDDEN) {
		super(message);
	}
}

export class InvalidEmailError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_EMAIL;
	constructor(message: string = messages.INVALID_EMAIL_FORMAT) {
		super(message);
	}
}

export class InvalidPhoneError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_PHONE;
	constructor(message: string = messages.INVALID_PHONE_FORMAT) {
		super(message);
	}
}

export class InvalidStaffRoleError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_STAFF_ROLE;
	constructor(message: string = messages.INVALID_STAFF_ROLE) {
		super(message);
	}
}

export class InvalidStaffStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_STAFF_STATUS;
	constructor(message: string = messages.INVALID_STAFF_STATUS) {
		super(message);
	}
}

export class StaffInvitationAlreadyPendingError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_INVITATION_ALREADY_PENDING;
	constructor(message: string = messages.STAFF_INVITATION_ALREADY_PENDING) {
		super(message);
	}
}

export class RestaurantNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_NOT_FOUND;
	constructor(message: string = messages.RESTAURANT_NOT_FOUND) {
		super(message);
	}
}

export class RestaurantAccountBlockedError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_ACCOUNT_BLOCKED;
	constructor(message: string = messages.RESTAURANT_ACCOUNT_BLOCKED) {
		super(message);
	}
}

export class RestaurantInactiveError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_INACTIVE;
	constructor(message: string = messages.RESTAURANT_INACTIVE) {
		super(message);
	}
}

export class RestaurantIdRequiredError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_ID_REQUIRED;
	constructor(message: string = messages.RESTAURANT_ID_REQUIRED) {
		super(message);
	}
}

export class InvalidInvitationTokenError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_INVITATION_TOKEN;
	constructor(message: string = messages.INVALID_INVITATION_TOKEN) {
		super(message);
	}
}

export class InvitationExpiredError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVITATION_EXPIRED;
	constructor(message: string = messages.INVITATION_EXPIRED) {
		super(message);
	}
}

export class StaffInvitationNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.STAFF_INVITATION_NOT_FOUND;
	constructor(message: string = messages.STAFF_INVITATION_NOT_FOUND) {
		super(message);
	}
}

export class InvalidInvitationStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_INVITATION_STATUS;
	constructor(message: string = messages.INVALID_INVITATION_STATUS) {
		super(message);
	}
}
