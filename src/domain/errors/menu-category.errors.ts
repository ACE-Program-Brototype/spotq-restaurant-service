import { DOMAIN_ERROR_CODES } from "@/domain/constants/error-code.constants.ts";
import { DomainError } from "./domain.error.ts";

export class CategoryAlreadyExistsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.CATEGORY_ALREADY_EXISTS;
}

export class InvalidCategoryDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_CATEGORY_DATA;
}

export class CategoryNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.CATEGORY_NOT_FOUND;
}
