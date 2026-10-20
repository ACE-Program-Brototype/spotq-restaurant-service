import { DOMAIN_ERROR_CODES } from "@domain/constants/error-code.constants";
import { messages as sharedMessage } from "@/shared/constants/message.constants";
import { DomainError } from "./domain.error";

export class InvalidTableSectionNameError extends DomainError {
	code = DOMAIN_ERROR_CODES.INVALID_TABLE_SECTION_NAME;
	constructor(
		message: string = sharedMessage.INVALID_TABLE_SECTION_NAME,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class TableSectionAlreadyExists extends DomainError {
	code = DOMAIN_ERROR_CODES.TABLE_SECTION_ALREADY_EXISTS;

	constructor(
		message: string = sharedMessage.TABLE_SECTION_ALREADY_EXISTS,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class TableSectionNotFound extends DomainError {
	code = DOMAIN_ERROR_CODES.TABLE_SECTION_NOT_FOUND;

	constructor(
		message: string = sharedMessage.TABLE_SECTION_NOT_FOUND,
		details?: unknown,
	) {
		super(message, details);
	}
}

export class TableSectionIdRequiredError extends DomainError {
	code = DOMAIN_ERROR_CODES.TABLE_SECTION_ID_REQUIRED;
	constructor(message: string = sharedMessage.TABLE_SECTION_ID_REQUIRED) {
		super(message);
	}
}

export class TableSectionInUseError extends DomainError {
	code = DOMAIN_ERROR_CODES.TABLE_SECTION_IN_USE;
	constructor(message: string = sharedMessage.TABLE_SECTION_IN_USE) {
		super(message);
	}
}
