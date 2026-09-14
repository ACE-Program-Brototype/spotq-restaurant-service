import { messages as sharedMessages } from "@/shared/constants/message.constants";
import { DOMAIN_ERROR_CODES } from "../constants/error-code.constants";
import { DomainError } from "./domain.error";

export class InvalidStorageKeyError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_STORAGE_KEY;
	constructor(message: string = sharedMessages.STORAGE_KEY_INVALID) {
		super(message);
	}
}
