import { messages as sharedMessages } from "@/shared/constants/message.constants.ts";
import { DOMAIN_ERROR_CODES } from "../constants/error-code.constants.ts";
import { DomainError } from "./domain.error.ts";

export class InvalidStorageKeyError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_STORAGE_KEY;
	constructor(message: string = sharedMessages.STORAGE_KEY_INVALID) {
		super(message);
	}
}
