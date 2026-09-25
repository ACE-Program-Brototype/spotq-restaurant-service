import { randomUUID } from "node:crypto";
import { InvalidAddonDataError } from "@/domain/errors/addon.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface AddonProps {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	price: number;
	imageKey: string | null;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateAddonProps {
	id?: string;
	restaurantId: string;
	name: string;
	description?: string | null;
	price: number;
	imageKey?: string | null;
	isAvailable?: boolean;
}

export interface ReconstituteAddonProps {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	price: number;
	imageKey: string | null;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateAddonProps {
	name?: string;
	description?: string | null;
	price?: number;
	imageKey?: string | null;
	isAvailable?: boolean;
}

export class Addon {
	private props: AddonProps;

	private constructor(props: AddonProps) {
		this.props = props;
	}

	public static create(createProps: CreateAddonProps): Addon {
		const trimmedName = createProps.name ? createProps.name.trim() : "";
		if (!trimmedName) {
			throw new InvalidAddonDataError(messages.ADDON_NAME_REQUIRED);
		}

		if (trimmedName.length > 255) {
			throw new InvalidAddonDataError(messages.ADDON_NAME_MAX_LENGTH);
		}

		if (!createProps.restaurantId?.trim()) {
			throw new InvalidAddonDataError(messages.INVALID_RESTAURANT_ID);
		}

		if (createProps.price === undefined || createProps.price === null) {
			throw new InvalidAddonDataError(messages.ADDON_PRICE_REQUIRED);
		}

		if (
			createProps.price < 0 ||
			Number.isNaN(createProps.price)
		) {
			throw new InvalidAddonDataError(messages.ADDON_PRICE_NEGATIVE);
		}

		if (createProps.price > 99999999.99) {
			throw new InvalidAddonDataError(messages.ADDON_PRICE_MAX_EXCEEDED);
		}

		const trimmedDescription = createProps.description?.trim() || null;
		if (trimmedDescription && trimmedDescription.length > 1000) {
			throw new InvalidAddonDataError(messages.ADDON_DESCRIPTION_MAX_LENGTH);
		}

		const trimmedImageKey = createProps.imageKey?.trim() || null;

		const now = new Date();
		return new Addon({
			id: createProps.id || randomUUID(),
			restaurantId: createProps.restaurantId.trim(),
			name: trimmedName,
			description: trimmedDescription,
			price: createProps.price,
			imageKey: trimmedImageKey,
			isAvailable: createProps.isAvailable ?? true,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(reconstituteProps: ReconstituteAddonProps): Addon {
		return new Addon({
			id: reconstituteProps.id,
			restaurantId: reconstituteProps.restaurantId,
			name: reconstituteProps.name,
			description: reconstituteProps.description,
			price: reconstituteProps.price,
			imageKey: reconstituteProps.imageKey,
			isAvailable: reconstituteProps.isAvailable,
			createdAt: reconstituteProps.createdAt,
			updatedAt: reconstituteProps.updatedAt,
		});
	}

	public update(updateProps: UpdateAddonProps): void {
		if (updateProps.name !== undefined) {
			const trimmedName = updateProps.name.trim();
			if (!trimmedName) {
				throw new InvalidAddonDataError(messages.ADDON_NAME_REQUIRED);
			}
			if (trimmedName.length > 255) {
				throw new InvalidAddonDataError(messages.ADDON_NAME_MAX_LENGTH);
			}
			this.props.name = trimmedName;
		}

		if (updateProps.description !== undefined) {
			const trimmedDescription = updateProps.description?.trim() || null;
			if (trimmedDescription && trimmedDescription.length > 1000) {
				throw new InvalidAddonDataError(messages.ADDON_DESCRIPTION_MAX_LENGTH);
			}
			this.props.description = trimmedDescription;
		}

		if (updateProps.price !== undefined) {
			if (
				typeof updateProps.price !== "number" ||
				Number.isNaN(updateProps.price) ||
				updateProps.price < 0
			) {
				throw new InvalidAddonDataError(messages.ADDON_PRICE_NEGATIVE);
			}
			if (updateProps.price > 99999999.99) {
				throw new InvalidAddonDataError(messages.ADDON_PRICE_MAX_EXCEEDED);
			}
			this.props.price = updateProps.price;
		}

		if (updateProps.imageKey !== undefined) {
			const trimmedImageKey = updateProps.imageKey?.trim() || null;
			this.props.imageKey = trimmedImageKey;
		}

		if (updateProps.isAvailable !== undefined) {
			if (typeof updateProps.isAvailable !== "boolean") {
				throw new InvalidAddonDataError(messages.ADDON_IS_AVAILABLE_INVALID);
			}
			this.props.isAvailable = updateProps.isAvailable;
		}

		this.props.updatedAt = new Date();
	}

	public get id(): string {
		return this.props.id;
	}

	public get restaurantId(): string {
		return this.props.restaurantId;
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

	public get imageKey(): string | null {
		return this.props.imageKey;
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
