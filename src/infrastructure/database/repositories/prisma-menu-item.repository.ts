import {
	Prisma,
	type PrismaClient,
	type MenuItem as PrismaMenuItem,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidMenuItemDataError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
} from "@/domain/errors/menu-item.errors.ts";
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
		const meta = (error as { meta?: { target?: string[] | string } })?.meta;
		if (
			code === "P2002" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		) {
			const target = Array.isArray(meta?.target)
				? meta?.target.join(",")
				: String(meta?.target || "");
			if (target.includes("addon")) {
				throw new InvalidMenuItemDataError(
					messages.DUPLICATE_ADDON_IN_MENU_ITEM,
				);
			}
			if (target.includes("default") || target.includes("variant")) {
				throw new InvalidVariantDataError(messages.MULTIPLE_DEFAULT_VARIANTS);
			}
			throw new MenuItemAlreadyExistsError(messages.MENU_ITEM_ALREADY_EXISTS);
		}
		if (
			code === "P2003" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2003")
		) {
			const field = String(
				(error as { meta?: { field_name?: string } })?.meta?.field_name || "",
			).toLowerCase();
			const message = String(
				(error as { message?: string })?.message || "",
			).toLowerCase();

			if (field.includes("category") || message.includes("category")) {
				throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
			}
			if (field.includes("addon") || message.includes("addon")) {
				throw new AddonNotFoundForRestaurantError(
					messages.ADDON_NOT_FOUND_FOR_RESTAURANT,
				);
			}
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

	public async createWithDetails(
		params: CreateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate> {
		try {
			return await this.rawPrisma.$transaction(async (tx) => {
				const itemData = this.mapper.toPersistence(params.menuItem);
				const createdItemRaw = await tx.menuItem.create({
					data: itemData,
				});

				const createdImagesRaw = await Promise.all(
					params.images.map((img) =>
						tx.menuItemImage.create({
							data: {
								menuItemId: createdItemRaw.id,
								objectKey: img.objectKey,
								displayOrder: img.displayOrder,
							},
						}),
					),
				);

				const createdVariantsRaw = await Promise.all(
					params.variants.map((variant) => {
						variant.assignMenuItemId(createdItemRaw.id);
						const variantData =
							MenuItemVariantPersistenceMapper.toPersistence(variant);
						return tx.menuItemVariant.create({
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
					}),
				);

				let createdAddonsRaw: Array<{
					id: string;
					menuItemId: string;
					addonId: string;
					name: string;
					price: number;
					priceOverride: number | null;
				}> = [];

				if (params.addons.length > 0) {
					const addonIds = params.addons.map((a) => a.addonId);
					const addonRecords = await tx.addon.findMany({
						where: { id: { in: addonIds } },
					});
					const addonMap = new Map(addonRecords.map((a) => [a.id, a]));

					createdAddonsRaw = await Promise.all(
						params.addons.map(async (addonLink) => {
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

							const addonRecord = addonMap.get(addonLink.addonId);
							return {
								id: createdJunction.id,
								menuItemId: createdItemRaw.id,
								addonId: addonLink.addonId,
								name: addonRecord?.name || "",
								price: Number(addonRecord?.price || 0),
								priceOverride:
									createdJunction.priceOverride !== null
										? Number(createdJunction.priceOverride)
										: null,
							};
						}),
					);
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
