import { randomUUID } from "node:crypto";
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
	createdAt: Date;
	updatedAt: Date;
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

		if (trimmedName.length > 255) {
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

		if (createProps.price > 99999999.99) {
			throw new InvalidMenuItemDataError(messages.PRICE_EXCEEDS_MAXIMUM);
		}

		if (
			createProps.preparationTime !== undefined &&
			createProps.preparationTime !== null &&
			createProps.preparationTime < 0
		) {
			throw new InvalidMenuItemDataError(messages.PREPARATION_TIME_NEGATIVE);
		}

		if (
			createProps.calories !== undefined &&
			createProps.calories !== null &&
			createProps.calories < 0
		) {
			throw new InvalidMenuItemDataError(messages.CALORIES_NEGATIVE);
		}

		const trimmedDescription = createProps.description?.trim() || null;
		if (trimmedDescription && trimmedDescription.length > 1000) {
			throw new InvalidMenuItemDataError(
				messages.MENU_ITEM_DESCRIPTION_MAX_LENGTH,
			);
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
			createdAt: reconstituteProps.createdAt,
			updatedAt: reconstituteProps.updatedAt,
		});
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

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}

	public updateAvailability(isAvailable: boolean): void {
		this.props.isAvailable = isAvailable;
		this.props.updatedAt = new Date();
	}
}
