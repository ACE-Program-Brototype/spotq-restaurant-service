import { messages as sharedMessages } from "@/shared/constants/message.constants.ts";
import { DOMAIN_ERROR_CODES } from "../constants/error-code.constants.ts";
import { DomainError } from "./domain.error.ts";

export const messages = {
	RESTAUARANT_NAME_REQUIRED:
		"Restaurant name is required and must be at least 2 characters",
	RESTAURANT_EMAIL_REQUIRED: "Valid restaurant email is required",
	RESTAURANT_PHONE_REQUIRED: "Valid restaurant phone is required",
	OWNER_NAME_REQUIRED:
		"Owner name is required and must be at least 2 characters",
	OWNER_EMAIL_REQUIRED: "Valid owner email is required",
	BLOCK_REASON_REQUIRED: "Block reason is required",
};

export class InvalidRestaurantDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_RESTAURANT_DATA;
	constructor(
		message: string = sharedMessages.INVALID_RESTAURANT_DATA,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class RestaurantNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_NOT_FOUND;
	constructor(message: string = sharedMessages.RESTAURANT_NOT_FOUND) {
		super(message);
	}
}

export class InvalidRestaurantStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_RESTAURANT_STATUS;
	constructor(message: string = sharedMessages.INVALID_RESTAURANT_STATUS) {
		super(message);
	}
}

export class InvalidOnboardingStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_ONBOARDING_STATUS;
	constructor(message: string = sharedMessages.INVALID_ONBOARDING_STATUS) {
		super(message);
	}
}

export class RestaurantAccountBlockedError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_ACCOUNT_BLOCKED;
	constructor(message: string = sharedMessages.RESTAURANT_ACCOUNT_BLOCKED) {
		super(message);
	}
}

export class RestaurantInactiveError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_INACTIVE;
	constructor(message: string = sharedMessages.RESTAURANT_INACTIVE) {
		super(message);
	}
}
