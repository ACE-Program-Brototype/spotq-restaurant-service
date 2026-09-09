import { messages } from "@/shared/constants/message.constants.ts";
import { DOMAIN_ERROR_CODES } from "../constants/error-code.constants.ts";
import { DomainError } from "./domain.error.ts";

export class InvalidRestaurantDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_RESTAURANT_DATA;
	constructor(
		message: string = messages.INVALID_RESTAURANT_DATA,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class RestaurantNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.RESTAURANT_NOT_FOUND;
	constructor(message: string = messages.RESTAURANT_NOT_FOUND) {
		super(message);
	}
}

export class InvalidRestaurantStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_RESTAURANT_STATUS;
	constructor(message: string = messages.INVALID_RESTAURANT_STATUS) {
		super(message);
	}
}

export class InvalidOnboardingStatusError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_ONBOARDING_STATUS;
	constructor(message: string = messages.INVALID_ONBOARDING_STATUS) {
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

