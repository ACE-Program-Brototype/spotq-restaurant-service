import {
	Prisma,
	type PrismaClient,
	type MenuItem as PrismaMenuItem,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import {
	ALLOWED_MENU_ITEM_SORT_FIELDS,
	DEFAULT_SORT_BY,
	DEFAULT_SORT_ORDER,
	type MenuItemSortField,
} from "@/domain/constants/menu-item.constants.ts";
import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { CategoryNotFoundError } from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	IMenuItemRepository,
	MenuItemQueryFilterParams,
	MenuItemQueryResult,
	MenuItemWithRelations,
	RestaurantMenuStats,
} from "@/domain/repositories/menu-item.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { MenuItemPersistenceMapper } from "../mappers/menu-item.mapper.ts";
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
		const isP2003 =
			code === "P2003" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2003");

		if (isP2003) {
			const meta = (
				error as {
					meta?: {
						field_name?: string;
						target?: string | string[];
						modelName?: string;
					};
				}
			)?.meta;

			const targetInfo = [
				meta?.field_name,
				Array.isArray(meta?.target) ? meta.target.join(" ") : meta?.target,
				error instanceof Error ? error.message : "",
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			if (targetInfo.includes("category")) {
				throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
			}

			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const isP2025 =
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2025");

		if (isP2025) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}
	}

	public async findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
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

	public async getRestaurantMenuStats(
		restaurantId: string,
	): Promise<RestaurantMenuStats> {
		try {
			const [totalCategories, totalMenuItems, availableItems, outOfStockItems] =
				await Promise.all([
					this.prismaClient.menuCategory.count({
						where: { restaurantId },
					}),
					this.prismaClient.menuItem.count({
						where: { restaurantId },
					}),
					this.prismaClient.menuItem.count({
						where: { restaurantId, isAvailable: true },
					}),
					this.prismaClient.menuItem.count({
						where: { restaurantId, isAvailable: false },
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

			// Define ordering
			const safeSortBy: MenuItemSortField = (
				ALLOWED_MENU_ITEM_SORT_FIELDS as readonly string[]
			).includes(sortBy)
				? (sortBy as MenuItemSortField)
				: DEFAULT_SORT_BY;
			const safeSortOrder =
				sortOrder === "asc" ? "asc" : DEFAULT_SORT_ORDER;
			const orderBy: Prisma.MenuItemOrderByWithRelationInput = {
				[safeSortBy]: safeSortOrder,
			};

			const skip = (page - 1) * limit;

			// Execute query, count, and overall stats in parallel
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
