import { DomainError } from "./domain.error.ts";

export const messages = {
	RESTAUARANT_NAME_REQUIRED: "Restaurant name is required and must be at least 2 characters",
	RESTAURANT_EMAIL_REQUIRED: "Valid restaurant email is required",
	RESTAURANT_PHONE_REQUIRED: "Valid restaurant phone is required",
	OWNER_NAME_REQUIRED: "Owner name is required and must be at least 2 characters",
	OWNER_EMAIL_REQUIRED: "Valid owner email is required",
	BLOCK_REASON_REQUIRED: "Block reason is required",
}

export class InvalidRestaurantDataError extends DomainError {
	public readonly code = "INVALID_RESTAURANT_DATA";
	constructor(message = "Invalid restaurant data provided", details?: unknown) {
		super(message, details);
	}
}

export class RestaurantNotFoundError extends DomainError {
	public readonly code = "RESTAURANT_NOT_FOUND";
	constructor(message = "Restaurant not found") {
		super(message);
	}
}

export class InvalidRestaurantStatusError extends DomainError {
	public readonly code = "INVALID_RESTAURANT_STATUS";
	constructor(message = "Invalid restaurant status specified") {
		super(message);
	}
}

export class InvalidOnboardingStatusError extends DomainError {
	public readonly code = "INVALID_ONBOARDING_STATUS";
	constructor(message = "Invalid onboarding status specified") {
		super(message);
	}
}
