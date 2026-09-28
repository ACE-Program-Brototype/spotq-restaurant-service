import { randomUUID } from "node:crypto";
import { InvalidVariantDataError } from "@/domain/errors/menu-item.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface MenuItemVariantProps {
	id: string;
	menuItemId: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMenuItemVariantProps {
	id?: string;
	menuItemId: string;
	sku?: string | null;
	name: string;
	price: number;
	isDefault?: boolean;
}

export interface ReconstituteMenuItemVariantProps {
	id: string;
	menuItemId: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class MenuItemVariant {
	private props: MenuItemVariantProps;

	private constructor(props: MenuItemVariantProps) {
		this.props = props;
	}

	public static create(
		createProps: CreateMenuItemVariantProps,
	): MenuItemVariant {
		const trimmedMenuItemId = createProps.menuItemId?.trim() || "";
		if (!trimmedMenuItemId) {
			throw new InvalidVariantDataError(messages.VARIANT_MENU_ITEM_ID_REQUIRED);
		}

		const trimmedName = createProps.name ? createProps.name.trim() : "";
		if (!trimmedName) {
			throw new InvalidVariantDataError(messages.VARIANT_NAME_REQUIRED);
		}

		if (trimmedName.length > 255) {
			throw new InvalidVariantDataError(messages.MENU_ITEM_NAME_MAX_LENGTH);
		}

		if (createProps.price === undefined || createProps.price === null) {
			throw new InvalidVariantDataError(messages.VARIANT_PRICE_REQUIRED);
		}

		if (createProps.price < 0 || Number.isNaN(createProps.price)) {
			throw new InvalidVariantDataError(messages.VARIANT_PRICE_NEGATIVE);
		}

		if (createProps.price > 99999999.99) {
			throw new InvalidVariantDataError(messages.PRICE_EXCEEDS_MAXIMUM);
		}

		const trimmedSku = createProps.sku
			? createProps.sku.trim().toUpperCase()
			: null;

		const now = new Date();
		return new MenuItemVariant({
			id: createProps.id || randomUUID(),
			menuItemId: trimmedMenuItemId,
			sku: trimmedSku,
			name: trimmedName,
			price: createProps.price,
			isDefault: createProps.isDefault ?? false,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		reconstituteProps: ReconstituteMenuItemVariantProps,
	): MenuItemVariant {
		return new MenuItemVariant({
			id: reconstituteProps.id,
			menuItemId: reconstituteProps.menuItemId,
			sku: reconstituteProps.sku,
			name: reconstituteProps.name,
			price: reconstituteProps.price,
			isDefault: reconstituteProps.isDefault,
			createdAt: reconstituteProps.createdAt,
			updatedAt: reconstituteProps.updatedAt,
		});
	}

	public get id(): string {
		return this.props.id;
	}

	public get menuItemId(): string {
		return this.props.menuItemId;
	}

	public get sku(): string | null {
		return this.props.sku;
	}

	public get name(): string {
		return this.props.name;
	}

	public get price(): number {
		return this.props.price;
	}

	public get isDefault(): boolean {
		return this.props.isDefault;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}

	public assignMenuItemId(menuItemId: string): void {
		this.props.menuItemId = menuItemId;
	}

	public setDefault(isDefault: boolean): void {
		this.props.isDefault = isDefault;
		this.props.updatedAt = new Date();
	}
}
