import { randomUUID } from "node:crypto";
import { InvalidCategoryDataError } from "@/domain/errors/menu-category.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface MenuCategoryProps {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	displayOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMenuCategoryProps {
	id?: string;
	restaurantId: string;
	name: string;
	description?: string | null;
	displayOrder?: number;
	isActive?: boolean;
}

export interface ReconstituteMenuCategoryProps {
	id: string;
	restaurantId: string;
	name: string;
	description: string | null;
	displayOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class MenuCategory {
	private props: MenuCategoryProps;

	private constructor(props: MenuCategoryProps) {
		this.props = props;
	}

	public static create(createProps: CreateMenuCategoryProps): MenuCategory {
		const trimmedName = createProps.name ? createProps.name.trim() : "";
		if (!trimmedName) {
			throw new InvalidCategoryDataError(messages.CATEGORY_NAME_REQUIRED);
		}

		if (!createProps.restaurantId?.trim()) {
			throw new InvalidCategoryDataError(messages.INVALID_RESTAURANT_ID);
		}

		const now = new Date();
		return new MenuCategory({
			id: createProps.id || randomUUID(),
			restaurantId: createProps.restaurantId.trim(),
			name: trimmedName,
			description: createProps.description?.trim() || null,
			displayOrder: createProps.displayOrder ?? 0,
			isActive: createProps.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		reconstituteProps: ReconstituteMenuCategoryProps,
	): MenuCategory {
		return new MenuCategory({
			id: reconstituteProps.id,
			restaurantId: reconstituteProps.restaurantId,
			name: reconstituteProps.name,
			description: reconstituteProps.description,
			displayOrder: reconstituteProps.displayOrder,
			isActive: reconstituteProps.isActive,
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

	public get name(): string {
		return this.props.name;
	}

	public get description(): string | null {
		return this.props.description;
	}

	public get displayOrder(): number {
		return this.props.displayOrder;
	}

	public get isActive(): boolean {
		return this.props.isActive;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}
}
