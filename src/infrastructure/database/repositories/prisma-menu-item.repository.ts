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
	ALLOWED_MENU_ITEM_SORT_FIELDS,
	DEFAULT_SORT_BY,
	DEFAULT_SORT_ORDER,
	type MenuItemSortField,
} from "@/domain/constants/menu-item.constants.ts";
import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import {
	AddonNotFoundForRestaurantError,
	CategoryNotFoundError,
	InvalidMenuItemDataError,
	InvalidVariantDataError,
	MenuItemAlreadyExistsError,
	MenuItemNotFoundError,
} from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CreateMenuItemRepositoryParams,
	MenuItemAggregate,
	MenuItemDetailsAggregate,
	MenuItemQueryFilterParams,
	MenuItemQueryResult,
	MenuItemWithRelations,
	RestaurantMenuStats,
	UpdateMenuItemRepositoryParams,
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
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prismaClient: PrismaClient,
	) {
		super(prismaClient.menuItem, MenuItemPersistenceMapper);
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
			const targetLower = target.toLowerCase();
			if (targetLower.includes("addon")) {
				throw new InvalidMenuItemDataError(
					messages.DUPLICATE_ADDON_IN_MENU_ITEM,
				);
			}
			if (
				targetLower.includes("default") ||
				targetLower.includes("variant") ||
				targetLower.includes("idx")
			) {
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

		if (
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2025")
		) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}
	}

	public async findByNameAndRestaurantId(
		nameOrRestaurantId: string,
		restaurantIdOrName: string,
	): Promise<MenuItem | null> {
		try {
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			let restaurantId = nameOrRestaurantId;
			let name = restaurantIdOrName;
			if (
				uuidRegex.test(restaurantIdOrName) &&
				!uuidRegex.test(nameOrRestaurantId)
			) {
				restaurantId = restaurantIdOrName;
				name = nameOrRestaurantId;
			}

			const record = await this.dbModel.findFirst({
				where: {
					restaurantId,
					name: {
						equals: name,
						mode: "insensitive",
					},
					isDeleted: false,
				},
			});
			return record ? this.mapper.toDomain(record) : null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public override async findById(id: string): Promise<MenuItem | null> {
		try {
			const record = await this.dbModel.findFirst({
				where: { id, isDeleted: false },
			});
			return record ? this.mapper.toDomain(record) : null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async findByIdAndRestaurantId(
		menuItemId: string,
		restaurantId: string,
	): Promise<MenuItemDetailsAggregate | null> {
		try {
			const record = await this.prismaClient.menuItem.findFirst({
				where: {
					id: menuItemId,
					restaurantId,
					isDeleted: false,
				},
				include: {
					category: true,
					images: {
						orderBy: {
							displayOrder: "asc",
						},
					},
					variants: {
						orderBy: [
							{ isDefault: "desc" },
							{ price: "asc" },
							{ createdAt: "asc" },
						],
					},
					addons: {
						where: {
							addon: {
								isDeleted: false,
							},
						},
						include: {
							addon: true,
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
			});

			if (!record) {
				return null;
			}

			const domainItem = this.mapper.toDomain(record);
			const domainVariants = record.variants.map((v) =>
				MenuItemVariantPersistenceMapper.toDomain(v),
			);
			const domainImages = record.images.map((img) => ({
				id: img.id,
				menuItemId: img.menuItemId,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
				createdAt: img.createdAt,
			}));

			const domainCategory = record.category
				? {
						id: record.category.id,
						name: record.category.name,
						description: record.category.description,
						isActive: record.category.isActive,
					}
				: null;

			const domainAddons = record.addons
				.filter((a) => a.addon && !a.addon.isDeleted)
				.map((a) => ({
					id: a.id,
					menuItemId: a.menuItemId,
					addonId: a.addonId,
					name: a.addon.name,
					description: a.addon.description,
					price: Number(a.addon.price),
					priceOverride:
						a.priceOverride !== null ? Number(a.priceOverride) : null,
					imageKey: a.addon.imageKey,
					isAvailable: a.addon.isAvailable,
					isDeleted: a.addon.isDeleted,
				}));

			return {
				item: domainItem,
				category: domainCategory,
				images: domainImages,
				variants: domainVariants,
				addons: domainAddons,
			};
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async getRestaurantMenuStats(
		restaurantId: string,
	): Promise<RestaurantMenuStats> {
		try {
			const [totalCategories, totalMenuItems, availableItems, outOfStockItems] =
				await Promise.all([
					this.prismaClient.menuCategory.count({
						where: { restaurantId, isDeleted: false },
					}),
					this.prismaClient.menuItem.count({
						where: {
							restaurantId,
							isDeleted: false,
							category: { isDeleted: false },
						},
					}),
					this.prismaClient.menuItem.count({
						where: {
							restaurantId,
							isDeleted: false,
							isAvailable: true,
							category: { isDeleted: false },
						},
					}),
					this.prismaClient.menuItem.count({
						where: {
							restaurantId,
							isDeleted: false,
							isAvailable: false,
							category: { isDeleted: false },
						},
					}),
				]);

			return {
				totalCategories,
				totalMenuItems,
				availableItems,
				outOfStockItems,
			};
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async updateMenuItem(item: MenuItem): Promise<MenuItem> {
		try {
			const data = this.mapper.toPersistence(item);
			if (data.isDeleted) {
				const result = await this.prismaClient.menuItem.updateMany({
					where: {
						id: data.id,
						restaurantId: data.restaurantId,
						isDeleted: false,
					},
					data: {
						isDeleted: true,
						updatedAt: data.updatedAt,
					},
				});

				if (result.count === 0) {
					throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
				}

				return item;
			}

			const updated = await this.dbModel.update({
				where: { id: data.id },
				data: {
					categoryId: data.categoryId,
					name: data.name,
					description: data.description,
					price: data.price,
					preparationTime: data.preparationTime,
					calories: data.calories,
					isVegetarian: data.isVegetarian,
					isFeatured: data.isFeatured,
					isAvailable: data.isAvailable,
					isDeleted: data.isDeleted,
					updatedAt: data.updatedAt,
				},
			});
			return this.mapper.toDomain(updated);
		} catch (error) {
			this.handlePrismaError(error, item);
			throw error;
		}
	}

	public async updateWithDetails(
		params: UpdateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate> {
		try {
			return await this.prismaClient.$transaction(async (tx) => {
				const itemData = this.mapper.toPersistence(params.menuItem);

				const updatedItemCount = await tx.menuItem.updateMany({
					where: {
						id: itemData.id,
						restaurantId: itemData.restaurantId,
						isDeleted: false,
					},
					data: {
						categoryId: itemData.categoryId,
						name: itemData.name,
						description: itemData.description,
						price: itemData.price,
						preparationTime: itemData.preparationTime,
						calories: itemData.calories,
						isVegetarian: itemData.isVegetarian,
						isFeatured: itemData.isFeatured,
						isAvailable: itemData.isAvailable,
						updatedAt: itemData.updatedAt,
					},
				});

				if (updatedItemCount.count === 0) {
					throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
				}

				if (params.images !== undefined) {
					await tx.menuItemImage.deleteMany({
						where: { menuItemId: itemData.id },
					});

					if (params.images.length > 0) {
						await Promise.all(
							params.images.map((img, index) =>
								tx.menuItemImage.create({
									data: {
										...(img.id ? { id: img.id } : {}),
										menuItemId: itemData.id,
										objectKey: img.objectKey,
										displayOrder: img.displayOrder ?? index,
									},
								}),
							),
						);
					}
				}

				if (params.variants !== undefined) {
					const existingVariants = await tx.menuItemVariant.findMany({
						where: { menuItemId: itemData.id },
					});
					const existingVariantMap = new Map(
						existingVariants.map((v) => [v.id, v]),
					);

					const keptVariantIds = params.variants
						.map((v) => v.id)
						.filter((id): id is string => Boolean(id && existingVariantMap.has(id)));

					// Delete removed variants first to free up any constraints
					await tx.menuItemVariant.deleteMany({
						where: {
							menuItemId: itemData.id,
							id: { notIn: keptVariantIds },
						},
					});

					// Reset isDefault on remaining variants to prevent unique index collisions
					await tx.menuItemVariant.updateMany({
						where: { menuItemId: itemData.id },
						data: { isDefault: false },
					});

					for (const variant of params.variants) {
						variant.assignMenuItemId(itemData.id);
						const variantData =
							MenuItemVariantPersistenceMapper.toPersistence(variant);

						if (existingVariantMap.has(variantData.id)) {
							await tx.menuItemVariant.update({
								where: { id: variantData.id },
								data: {
									sku: variantData.sku,
									name: variantData.name,
									price: variantData.price,
									isDefault: variantData.isDefault,
									isAvailable: variantData.isAvailable,
									updatedAt: variantData.updatedAt,
								},
							});
						} else {
							await tx.menuItemVariant.create({
								data: {
									id: variantData.id,
									menuItemId: itemData.id,
									sku: variantData.sku,
									name: variantData.name,
									price: variantData.price,
									isDefault: variantData.isDefault,
									isAvailable: variantData.isAvailable,
									createdAt: variantData.createdAt,
									updatedAt: variantData.updatedAt,
								},
							});
						}
					}
				}

				if (params.addons !== undefined) {
					await tx.menuItemAddon.deleteMany({
						where: { menuItemId: itemData.id },
					});

					if (params.addons.length > 0) {
						await Promise.all(
							params.addons.map((addonLink) =>
								tx.menuItemAddon.create({
									data: {
										menuItemId: itemData.id,
										addonId: addonLink.addonId,
										priceOverride:
											addonLink.priceOverride !== null
												? new Prisma.Decimal(addonLink.priceOverride)
												: null,
									},
								}),
							),
						);
					}
				}

				const fullItem = await tx.menuItem.findUniqueOrThrow({
					where: { id: itemData.id },
					include: {
						images: {
							orderBy: {
								displayOrder: "asc",
							},
						},
						variants: {
							orderBy: [
								{ isDefault: "desc" },
								{ price: "asc" },
								{ createdAt: "asc" },
							],
						},
						addons: {
							where: {
								addon: {
									isDeleted: false,
								},
							},
							include: {
								addon: true,
							},
							orderBy: {
								createdAt: "asc",
							},
						},
					},
				});

				const domainItem = this.mapper.toDomain(fullItem);
				const domainVariants = fullItem.variants.map((v) =>
					MenuItemVariantPersistenceMapper.toDomain(v),
				);
				const domainImages = fullItem.images.map((img) => ({
					id: img.id,
					menuItemId: img.menuItemId,
					objectKey: img.objectKey,
					displayOrder: img.displayOrder,
					createdAt: img.createdAt,
				}));
				const domainAddons = fullItem.addons.map((a) => ({
					id: a.id,
					menuItemId: a.menuItemId,
					addonId: a.addonId,
					name: a.addon?.name || "",
					price: Number(a.addon?.price || 0),
					priceOverride:
						a.priceOverride !== null ? Number(a.priceOverride) : null,
				}));

				return {
					item: domainItem,
					images: domainImages,
					variants: domainVariants,
					addons: domainAddons,
				};
			});
		} catch (error) {
			this.handlePrismaError(error, params);
			throw error;
		}
	}

	public async updateAvailability(item: MenuItem): Promise<MenuItem> {
		try {
			const data = this.mapper.toPersistence(item);
			await this.prismaClient.$transaction(async (tx) => {
				const result = await tx.menuItem.updateMany({
					where: {
						id: data.id,
						restaurantId: data.restaurantId,
						isDeleted: false,
					},
					data: {
						isAvailable: data.isAvailable,
						updatedAt: data.updatedAt,
					},
				});

				if (result.count === 0) {
					throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
				}

				await tx.menuItemVariant.updateMany({
					where: {
						menuItemId: data.id,
					},
					data: {
						isAvailable: data.isAvailable,
						updatedAt: data.updatedAt,
					},
				});
			});

			return item;
		} catch (error) {
			this.handlePrismaError(error, item);
			throw error;
		}
	}

	public async createWithDetails(
		params: CreateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate> {
		try {
			return await this.prismaClient.$transaction(async (tx) => {
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
								isAvailable: variantData.isAvailable,
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

	public async findManyWithFiltersAndStats(
		params: MenuItemQueryFilterParams,
	): Promise<MenuItemQueryResult> {
		try {
			const {
				restaurantId,
				categoryId,
				search,
				isAvailable,
				isVegetarian,
				isFeatured,
				minPrice,
				maxPrice,
				sortBy = "createdAt",
				sortOrder = "desc",
				page = 1,
				limit = 10,
			} = params;

			const where: Prisma.MenuItemWhereInput = {
				restaurantId,
				isDeleted: false,
				category: {
					isDeleted: false,
					...(typeof params.categoryIsActive === "boolean" && {
						isActive: params.categoryIsActive,
					}),
				},
			};

			if (categoryId) {
				where.categoryId = categoryId;
			}

			if (typeof isAvailable === "boolean") {
				where.isAvailable = isAvailable;
			}

			if (typeof isVegetarian === "boolean") {
				where.isVegetarian = isVegetarian;
			}

			if (typeof isFeatured === "boolean") {
				where.isFeatured = isFeatured;
			}

			if (minPrice !== undefined || maxPrice !== undefined) {
				where.price = {};
				if (minPrice !== undefined) {
					where.price.gte = new Prisma.Decimal(minPrice);
				}
				if (maxPrice !== undefined) {
					where.price.lte = new Prisma.Decimal(maxPrice);
				}
			}

			if (search && search.trim().length > 0) {
				const trimmedSearch = search.trim();
				where.OR = [
					{ name: { contains: trimmedSearch, mode: "insensitive" } },
					{ description: { contains: trimmedSearch, mode: "insensitive" } },
				];
			}

			const safeSortBy: MenuItemSortField = (
				ALLOWED_MENU_ITEM_SORT_FIELDS as readonly string[]
			).includes(sortBy)
				? (sortBy as MenuItemSortField)
				: DEFAULT_SORT_BY;
			const safeSortOrder = sortOrder === "asc" ? "asc" : DEFAULT_SORT_ORDER;
			const orderBy: Prisma.MenuItemOrderByWithRelationInput = {
				[safeSortBy]: safeSortOrder,
			};

			const skip = (page - 1) * limit;

			const [records, filteredTotal, stats] = await Promise.all([
				this.prismaClient.menuItem.findMany({
					where,
					include: {
						category: {
							select: {
								name: true,
							},
						},
						images: {
							orderBy: {
								displayOrder: "asc",
							},
							take: 1,
						},
					},
					orderBy,
					skip,
					take: limit,
				}),
				this.prismaClient.menuItem.count({ where }),
				this.getRestaurantMenuStats(restaurantId),
			]);

			const items: MenuItemWithRelations[] = records.map((record) => {
				const primaryImage =
					record.images.length > 0 ? record.images[0].objectKey : null;

				return {
					id: record.id,
					restaurantId: record.restaurantId,
					categoryId: record.categoryId,
					categoryName: record.category?.name ?? "",
					name: record.name,
					price: Number(record.price),
					isVegetarian: record.isVegetarian,
					isFeatured: record.isFeatured,
					isAvailable: record.isAvailable,
					image: primaryImage,
					createdAt: record.createdAt,
					updatedAt: record.updatedAt,
				};
			});

			return {
				items,
				total: filteredTotal,
				stats,
			};
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}
}
