import { DOMAIN_ERROR_CODES } from "@/domain/constants/error-code.constants.ts";
import { DomainError } from "@/domain/errors/domain.error.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export class AddonAlreadyExistsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.ADDON_ALREADY_EXISTS;

	constructor(message: string = messages.ADDON_ALREADY_EXISTS) {
		super(message);
	}
}

export class InvalidAddonDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_ADDON_DATA;
}

export class AddonNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.ADDON_NOT_FOUND;

	constructor(message: string = messages.ADDON_NOT_FOUND) {
		super(message);
	}
}
