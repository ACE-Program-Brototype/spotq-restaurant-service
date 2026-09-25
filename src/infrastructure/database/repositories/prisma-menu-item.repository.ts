import {
	Prisma,
	type PrismaClient,
	type MenuItem as PrismaMenuItem,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemAlreadyExistsError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CreateMenuItemRepositoryParams,
	MenuItemAggregate,
} from "@/domain/repositories/menu-item.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	MenuItemPersistenceMapper,
	MenuItemVariantPersistenceMapper,
} from "../mappers/menu-item.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaMenuItemRepository
	extends PrismaBaseRepository<
		MenuItem,
		PrismaMenuItem,
		PrismaClient["menuItem"]
	>
	implements IMenuItemRepository
{
	private readonly rawPrisma: PrismaClient;

	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma.menuItem, MenuItemPersistenceMapper);
		this.rawPrisma = prisma;
	}

	protected override handlePrismaError(
		error: unknown,
		_context?: unknown,
	): void {
		const code = (error as { code?: string })?.code;
		if (
			code === "P2002" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		) {
			throw new MenuItemAlreadyExistsError(messages.MENU_ITEM_ALREADY_EXISTS);
		}
		if (
			code === "P2003" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2003")
		) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}
	}

	public async findByNameAndRestaurantId(
		name: string,
		restaurantId: string,
	): Promise<MenuItem | null> {
		try {
			const record = await this.dbModel.findFirst({
				where: {
					restaurantId,
					name: {
						equals: name,
						mode: "insensitive",
					},
				},
			});
			return record ? this.mapper.toDomain(record) : null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async findById(id: string): Promise<MenuItem | null> {
		try {
			const record = await this.dbModel.findUnique({
				where: { id },
			});
			return record ? this.mapper.toDomain(record) : null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async verifyCategoryBelongsToRestaurant(
		categoryId: string,
		restaurantId: string,
	): Promise<boolean> {
		try {
			const category = await this.rawPrisma.menuCategory.findFirst({
				where: {
					id: categoryId,
					restaurantId,
				},
			});
			return category !== null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async verifyAddonsBelongToRestaurant(
		addonIds: string[],
		restaurantId: string,
	): Promise<boolean> {
		if (addonIds.length === 0) {
			return true;
		}

		try {
			const count = await this.rawPrisma.addon.count({
				where: {
					id: { in: addonIds },
					restaurantId,
				},
			});
			return count === addonIds.length;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async createWithDetails(
		params: CreateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate> {
		try {
			return await this.rawPrisma.$transaction(async (tx) => {
				const itemData = this.mapper.toPersistence(params.menuItem);
				const createdItemRaw = await tx.menuItem.create({
					data: itemData,
				});

				const createdImagesRaw: Array<{
					id: string;
					menuItemId: string;
					objectKey: string;
					displayOrder: number;
					createdAt: Date;
				}> = [];

				for (const img of params.images) {
					const createdImg = await tx.menuItemImage.create({
						data: {
							menuItemId: createdItemRaw.id,
							objectKey: img.objectKey,
							displayOrder: img.displayOrder,
						},
					});
					createdImagesRaw.push(createdImg);
				}

				const createdVariantsRaw: Array<{
					id: string;
					menuItemId: string;
					sku: string | null;
					name: string;
					price: Prisma.Decimal;
					isDefault: boolean;
					createdAt: Date;
					updatedAt: Date;
				}> = [];

				for (const variant of params.variants) {
					variant.assignMenuItemId(createdItemRaw.id);
					const variantData =
						MenuItemVariantPersistenceMapper.toPersistence(variant);
					const createdVar = await tx.menuItemVariant.create({
						data: {
							id: variantData.id,
							menuItemId: createdItemRaw.id,
							sku: variantData.sku,
							name: variantData.name,
							price: variantData.price,
							isDefault: variantData.isDefault,
							createdAt: variantData.createdAt,
							updatedAt: variantData.updatedAt,
						},
					});
					createdVariantsRaw.push(createdVar);
				}

				const createdAddonsRaw: Array<{
					id: string;
					menuItemId: string;
					addonId: string;
					name: string;
					price: number;
					priceOverride: number | null;
					displayOrder: number;
				}> = [];

				for (const addonLink of params.addons) {
					const addonRecord = await tx.addon.findUnique({
						where: { id: addonLink.addonId },
					});

					const createdJunction = await tx.menuItemAddon.create({
						data: {
							menuItemId: createdItemRaw.id,
							addonId: addonLink.addonId,
							priceOverride:
								addonLink.priceOverride !== null
									? new Prisma.Decimal(addonLink.priceOverride)
									: null,
						},
					});

					createdAddonsRaw.push({
						id: createdJunction.id,
						menuItemId: createdItemRaw.id,
						addonId: addonLink.addonId,
						name: addonRecord?.name || "",
						price: Number(addonRecord?.price || 0),
						priceOverride:
							createdJunction.priceOverride !== null
								? Number(createdJunction.priceOverride)
								: null,
						displayOrder: addonLink.displayOrder,
					});
				}

				const domainItem = this.mapper.toDomain(createdItemRaw);
				const domainVariants = createdVariantsRaw.map((v) =>
					MenuItemVariantPersistenceMapper.toDomain(v),
				);

				return {
					item: domainItem,
					images: createdImagesRaw,
					variants: domainVariants,
					addons: createdAddonsRaw,
				};
			});
		} catch (error) {
			this.handlePrismaError(error, params);
			throw error;
		}
	}
}
