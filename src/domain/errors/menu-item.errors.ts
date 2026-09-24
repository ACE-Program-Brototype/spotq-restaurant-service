import { DOMAIN_ERROR_CODES } from "@/domain/constants/error-code.constants.ts";
import { DomainError } from "@/domain/errors/domain.error.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export class MenuItemAlreadyExistsError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.MENU_ITEM_ALREADY_EXISTS;

	constructor(message: string = messages.MENU_ITEM_ALREADY_EXISTS) {
		super(message);
	}
}

export class MenuItemNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.MENU_ITEM_NOT_FOUND;

	constructor(message: string = messages.MENU_ITEM_NOT_FOUND) {
		super(message);
	}
}

export class CategoryNotFoundError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.CATEGORY_NOT_FOUND;

	constructor(message: string = messages.CATEGORY_NOT_FOUND) {
		super(message);
	}
}

export class AddonNotFoundForRestaurantError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.ADDON_NOT_FOUND_FOR_RESTAURANT;

	constructor(message: string = messages.ADDON_NOT_FOUND_FOR_RESTAURANT) {
		super(message);
	}
}

export class InvalidMenuItemDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_MENU_ITEM_DATA;
}

export class InvalidVariantDataError extends DomainError {
	public readonly code = DOMAIN_ERROR_CODES.INVALID_VARIANT_DATA;
}
