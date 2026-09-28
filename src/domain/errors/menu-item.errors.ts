import { DomainError } from "./domain.error.ts";

export class MenuItemError extends DomainError {}

export class MenuItemNotFoundError extends MenuItemError {
	constructor(message = "Menu item not found") {
		super(message);
		this.name = "MenuItemNotFoundError";
	}
}

export class InvalidMenuItemDataError extends MenuItemError {
	constructor(message = "Invalid menu item data provided") {
		super(message);
		this.name = "InvalidMenuItemDataError";
	}
}
