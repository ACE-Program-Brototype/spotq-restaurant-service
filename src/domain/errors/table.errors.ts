import { DOMAIN_ERROR_CODES } from "@domain/constants/error-code.constants";
import { messages } from "@shared/constants/message.constants";
import { DomainError } from "./domain.error";

export class InvalidTableCapacityError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_TABLE_CAPACITY;

	constructor(message: string = messages.INVALID_TABLE_CAPACITY) {
		super(message);
	}
}

export class InvalidTableCodeError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_TABLE_CODE;

	constructor(message: string = messages.INVALID_TABLE_CODE) {
		super(message);
	}
}

export class InvalidTableShapeError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_TABLE_SHAPE;

	constructor(message: string = messages.INVALID_TABLE_SHAPE) {
		super(message);
	}
}

export class TableNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_NOT_FOUND;

	constructor(message: string = messages.TABLE_NOT_FOUND) {
		super(message);
	}
}

export class TableAlreadyExistsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_ALREADY_EXISTS;

	constructor(message: string = messages.TABLE_ALREADY_EXISTS) {
		super(message);
	}
}

export class TableCapacityExceededError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_CAPACITY_EXCEEDED;

	constructor(message: string = messages.TABLE_CAPACITY_EXCEEDED) {
		super(message);
	}
}

export class InvalidTableOccupancyError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_TABLE_OCCUPANCY;

	constructor(message: string = messages.INVALID_TABLE_OCCUPANCY) {
		super(message);
	}
}

export class TableAlreadyOccupiedError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_ALREADY_OCCUPIED;

	constructor(message: string = messages.TABLE_ALREADY_OCCUPIED) {
		super(message);
	}
}

export class TableInvalidTransitionError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_INVALID_TRANSITION;

	constructor(message: string = messages.TABLE_INVALID_TRANSITION) {
		super(message);
	}
}

export class TableMustBeUnOccupiedError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_MUST_BE_UNOCCUPIED;

	constructor(message: string = messages.TABLE_MUST_BE_UNOCCUPIED) {
		super(message);
	}
}

export class TableInUseError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_IN_USE;

	constructor(message: string = messages.TABLE_IN_USE) {
		super(message);
	}
}

export class TableNotAvailableError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.TABLE_NOT_AVAILABLE;

	constructor(message: string = messages.TABLE_NOT_AVAILABLE) {
		super(message);
	}
}
