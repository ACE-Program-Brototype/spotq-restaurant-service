import { DomainError } from "./domain.error.ts";

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
