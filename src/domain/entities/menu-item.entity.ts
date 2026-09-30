import { randomUUID } from "node:crypto";
import {
	MENU_ITEM_CALORIES_MAX,
	MENU_ITEM_DESCRIPTION_MAX_LENGTH,
	MENU_ITEM_NAME_MAX_LENGTH,
	MENU_ITEM_PREPARATION_TIME_MAX,
	MENU_ITEM_PRICE_MAX,
} from "@/domain/constants/menu-item.constants.ts";
import { InvalidMenuItemDataError } from "@/domain/errors/menu-item.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface MenuItemProps {
	id: string;
	restaurantId: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMenuItemProps {
	id?: string;
	restaurantId: string;
	categoryId: string;
	name: string;
	description?: string | null;
	price: number;
	preparationTime?: number | null;
	calories?: number | null;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	isAvailable?: boolean;
	isDeleted?: boolean;
}

export interface ReconstituteMenuItemProps {
	id: string;
	restaurantId: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateMenuItemProps {
	categoryId?: string;
	name?: string;
	description?: string | null;
	price?: number;
	preparationTime?: number | null;
	calories?: number | null;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	isAvailable?: boolean;
}

export class MenuItem {
	private props: MenuItemProps;

	private constructor(props: MenuItemProps) {
		this.props = props;
	}

	public static create(createProps: CreateMenuItemProps): MenuItem {
		const trimmedName = createProps.name ? createProps.name.trim() : "";
		if (!trimmedName) {
			throw new InvalidMenuItemDataError(messages.MENU_ITEM_NAME_REQUIRED);
		}

		if (trimmedName.length > MENU_ITEM_NAME_MAX_LENGTH) {
			throw new InvalidMenuItemDataError(messages.MENU_ITEM_NAME_MAX_LENGTH);
		}

		if (!createProps.restaurantId?.trim()) {
			throw new InvalidMenuItemDataError(messages.INVALID_RESTAURANT_ID);
		}

		if (!createProps.categoryId?.trim()) {
			throw new InvalidMenuItemDataError(messages.INVALID_CATEGORY_ID);
		}

		if (createProps.price === undefined || createProps.price === null) {
			throw new InvalidMenuItemDataError(messages.MENU_ITEM_PRICE_REQUIRED);
		}

		if (createProps.price < 0 || Number.isNaN(createProps.price)) {
			throw new InvalidMenuItemDataError(messages.MENU_ITEM_PRICE_NEGATIVE);
		}

		if (createProps.price > MENU_ITEM_PRICE_MAX) {
			throw new InvalidMenuItemDataError(messages.MENU_ITEM_PRICE_MAX_EXCEEDED);
		}

		const trimmedDescription = createProps.description?.trim() || null;
		if (
			trimmedDescription &&
			trimmedDescription.length > MENU_ITEM_DESCRIPTION_MAX_LENGTH
		) {
			throw new InvalidMenuItemDataError(
				messages.MENU_ITEM_DESCRIPTION_MAX_LENGTH,
			);
		}

		if (
			createProps.preparationTime !== undefined &&
			createProps.preparationTime !== null
		) {
			if (
				createProps.preparationTime < 0 ||
				createProps.preparationTime > MENU_ITEM_PREPARATION_TIME_MAX
			) {
				throw new InvalidMenuItemDataError(
					messages.MENU_ITEM_PREPARATION_TIME_INVALID,
				);
			}
		}

		if (createProps.calories !== undefined && createProps.calories !== null) {
			if (
				createProps.calories < 0 ||
				createProps.calories > MENU_ITEM_CALORIES_MAX
			) {
				throw new InvalidMenuItemDataError(messages.MENU_ITEM_CALORIES_INVALID);
			}
		}

		const now = new Date();
		return new MenuItem({
			id: createProps.id || randomUUID(),
			restaurantId: createProps.restaurantId.trim(),
			categoryId: createProps.categoryId.trim(),
			name: trimmedName,
			description: trimmedDescription,
			price: createProps.price,
			preparationTime: createProps.preparationTime ?? null,
			calories: createProps.calories ?? null,
			isVegetarian: createProps.isVegetarian ?? false,
			isFeatured: createProps.isFeatured ?? false,
			isAvailable: createProps.isAvailable ?? true,
			isDeleted: createProps.isDeleted ?? false,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		reconstituteProps: ReconstituteMenuItemProps,
	): MenuItem {
		return new MenuItem({
			id: reconstituteProps.id,
			restaurantId: reconstituteProps.restaurantId,
			categoryId: reconstituteProps.categoryId,
			name: reconstituteProps.name,
			description: reconstituteProps.description,
			price: reconstituteProps.price,
			preparationTime: reconstituteProps.preparationTime,
			calories: reconstituteProps.calories,
			isVegetarian: reconstituteProps.isVegetarian,
			isFeatured: reconstituteProps.isFeatured,
			isAvailable: reconstituteProps.isAvailable,
			isDeleted: reconstituteProps.isDeleted ?? false,
			createdAt: reconstituteProps.createdAt,
			updatedAt: reconstituteProps.updatedAt,
		});
	}

	public update(updateProps: UpdateMenuItemProps): void {
		if (this.props.isDeleted) {
			throw new InvalidMenuItemDataError(
				messages.CANNOT_MODIFY_DELETED_MENU_ITEM,
			);
		}

		if (updateProps.name !== undefined) {
			const trimmedName = updateProps.name.trim();
			if (!trimmedName) {
				throw new InvalidMenuItemDataError(messages.MENU_ITEM_NAME_REQUIRED);
			}
			if (trimmedName.length > MENU_ITEM_NAME_MAX_LENGTH) {
				throw new InvalidMenuItemDataError(messages.MENU_ITEM_NAME_MAX_LENGTH);
			}
			this.props.name = trimmedName;
		}

		if (updateProps.categoryId !== undefined) {
			const trimmedCategoryId = updateProps.categoryId.trim();
			if (!trimmedCategoryId) {
				throw new InvalidMenuItemDataError(messages.INVALID_CATEGORY_ID);
			}
			this.props.categoryId = trimmedCategoryId;
		}

		if (updateProps.description !== undefined) {
			const trimmedDescription = updateProps.description?.trim() || null;
			if (
				trimmedDescription &&
				trimmedDescription.length > MENU_ITEM_DESCRIPTION_MAX_LENGTH
			) {
				throw new InvalidMenuItemDataError(
					messages.MENU_ITEM_DESCRIPTION_MAX_LENGTH,
				);
			}
			this.props.description = trimmedDescription;
		}

		if (updateProps.price !== undefined) {
			if (
				typeof updateProps.price !== "number" ||
				Number.isNaN(updateProps.price) ||
				updateProps.price < 0
			) {
				throw new InvalidMenuItemDataError(messages.MENU_ITEM_PRICE_NEGATIVE);
			}
			if (updateProps.price > MENU_ITEM_PRICE_MAX) {
				throw new InvalidMenuItemDataError(
					messages.MENU_ITEM_PRICE_MAX_EXCEEDED,
				);
			}
			this.props.price = updateProps.price;
		}

		if (updateProps.preparationTime !== undefined) {
			if (
				updateProps.preparationTime !== null &&
				(updateProps.preparationTime < 0 ||
					updateProps.preparationTime > MENU_ITEM_PREPARATION_TIME_MAX)
			) {
				throw new InvalidMenuItemDataError(
					messages.MENU_ITEM_PREPARATION_TIME_INVALID,
				);
			}
			this.props.preparationTime = updateProps.preparationTime;
		}

		if (updateProps.calories !== undefined) {
			if (
				updateProps.calories !== null &&
				(updateProps.calories < 0 ||
					updateProps.calories > MENU_ITEM_CALORIES_MAX)
			) {
				throw new InvalidMenuItemDataError(messages.MENU_ITEM_CALORIES_INVALID);
			}
			this.props.calories = updateProps.calories;
		}

		if (updateProps.isVegetarian !== undefined) {
			this.props.isVegetarian = updateProps.isVegetarian;
		}

		if (updateProps.isFeatured !== undefined) {
			this.props.isFeatured = updateProps.isFeatured;
		}

		if (updateProps.isAvailable !== undefined) {
			this.props.isAvailable = updateProps.isAvailable;
		}

		this.props.updatedAt = new Date();
	}

	public updateAvailability(isAvailable: boolean): void {
		if (this.props.isDeleted) {
			throw new InvalidMenuItemDataError(
				messages.CANNOT_MODIFY_DELETED_MENU_ITEM,
			);
		}
		this.props.isAvailable = isAvailable;
		this.props.updatedAt = new Date();
	}

	public softDelete(): void {
		if (this.props.isDeleted) {
			throw new InvalidMenuItemDataError(
				messages.CANNOT_MODIFY_DELETED_MENU_ITEM,
			);
		}
		this.props.isDeleted = true;
		this.props.updatedAt = new Date();
	}

	public get id(): string {
		return this.props.id;
	}

	public get restaurantId(): string {
		return this.props.restaurantId;
	}

	public get categoryId(): string {
		return this.props.categoryId;
	}

	public get name(): string {
		return this.props.name;
	}

	public get description(): string | null {
		return this.props.description;
	}

	public get price(): number {
		return this.props.price;
	}

	public get preparationTime(): number | null {
		return this.props.preparationTime;
	}

	public get calories(): number | null {
		return this.props.calories;
	}

	public get isVegetarian(): boolean {
		return this.props.isVegetarian;
	}

	public get isFeatured(): boolean {
		return this.props.isFeatured;
	}

	public get isAvailable(): boolean {
		return this.props.isAvailable;
	}

	public get isDeleted(): boolean {
		return this.props.isDeleted;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}
}
