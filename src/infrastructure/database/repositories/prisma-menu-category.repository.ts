import {
	Prisma,
	type PrismaClient,
	type MenuCategory as PrismaMenuCategory,
} from "@prisma/client";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import {
	CategoryAlreadyExistsError,
	CategoryHasMenuItemsError,
	CategoryNotFoundError,
} from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { MenuCategoryPersistenceMapper } from "../mappers/menu-category.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaMenuCategoryRepository
	extends PrismaBaseRepository<
		MenuCategory,
		PrismaMenuCategory,
		PrismaClient["menuCategory"]
	>
	implements IMenuCategoryRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prismaClient: PrismaClient,
	) {
		super(prismaClient.menuCategory, MenuCategoryPersistenceMapper, {
			P2002: () =>
				new CategoryAlreadyExistsError(messages.CATEGORY_ALREADY_EXISTS),
			P2003: () =>
				new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND),
			P2025: () =>
				new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND),
		});
	}

	public async findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
	): Promise<MenuCategory | null> {
		return this.run(async () => {
			const record = await this.dbModel.findFirst({
				where: {
					restaurantId,
					name: {
						equals: name,
						mode: Prisma.QueryMode.insensitive,
					},
					isDeleted: false,
				},
			});
			return record ? this.mapper.toDomain(record) : null;
		});
	}

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<MenuCategory[]> {
		return this.run(async () => {
			const records = await this.dbModel.findMany({
				where: { restaurantId, isDeleted: false },
				orderBy: { displayOrder: "asc" },
			});
			return records.map((record) => this.mapper.toDomain(record));
		});
	}

	public async getNextDisplayOrder(restaurantId: string): Promise<number> {
		return this.run(async () => {
			const last = await this.dbModel.findFirst({
				where: { restaurantId, isDeleted: false },
				orderBy: { displayOrder: "desc" },
				select: { displayOrder: true },
			});
			return last ? last.displayOrder + 1 : 0;
		});
	}

	public async create(category: MenuCategory): Promise<MenuCategory> {
		return this.run(async () => {
			const data = this.mapper.toPersistence(category);
			const created = await this.prismaClient.$transaction(async (tx) => {
				await tx.menuCategory.updateMany({
					where: {
						restaurantId: data.restaurantId,
						isDeleted: false,
						displayOrder: {
							gte: data.displayOrder,
						},
					},
					data: {
						displayOrder: {
							increment: 1,
						},
					},
				});

				return tx.menuCategory.create({ data });
			});
			return this.mapper.toDomain(created);
		});
	}

	public async updateCategory(
		category: MenuCategory,
		previousDisplayOrder?: number,
	): Promise<MenuCategory> {
		return this.run(async () => {
			const data = this.mapper.toPersistence(category);
			const { id, restaurantId, displayOrder } = data;

			if (
				previousDisplayOrder !== undefined &&
				previousDisplayOrder !== displayOrder
			) {
				const updated = await this.prismaClient.$transaction(async (tx) => {
					if (displayOrder < previousDisplayOrder) {
						await tx.menuCategory.updateMany({
							where: {
								restaurantId,
								isDeleted: false,
								id: { not: id },
								displayOrder: {
									gte: displayOrder,
									lt: previousDisplayOrder,
								},
							},
							data: {
								displayOrder: {
									increment: 1,
								},
							},
						});
					} else {
						await tx.menuCategory.updateMany({
							where: {
								restaurantId,
								isDeleted: false,
								id: { not: id },
								displayOrder: {
									gt: previousDisplayOrder,
									lte: displayOrder,
								},
							},
							data: {
								displayOrder: {
									decrement: 1,
								},
							},
						});
					}

					return tx.menuCategory.update({
						where: { id },
						data: {
							name: data.name,
							description: data.description,
							displayOrder: data.displayOrder,
							isActive: data.isActive,
							updatedAt: data.updatedAt,
						},
					});
				});
				return this.mapper.toDomain(updated);
			}

			if (data.isDeleted) {
				const result = await this.prismaClient.menuCategory.updateMany({
					where: {
						id,
						isDeleted: false,
						menuItems: { none: { isDeleted: false } },
					},
					data: {
						name: data.name,
						description: data.description,
						displayOrder: data.displayOrder,
						isActive: data.isActive,
						isDeleted: data.isDeleted,
						updatedAt: data.updatedAt,
					},
				});

				if (result.count === 0) {
					const hasItems = await this.hasMenuItems(id);
					if (hasItems) {
						throw new CategoryHasMenuItemsError(
							messages.CATEGORY_HAS_MENU_ITEMS,
						);
					}
					throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
				}

				const updated = await this.dbModel.findUnique({ where: { id } });
				if (!updated) {
					throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
				}
				return this.mapper.toDomain(updated);
			}

			const updated = await this.dbModel.update({
				where: { id },
				data: {
					name: data.name,
					description: data.description,
					displayOrder: data.displayOrder,
					isActive: data.isActive,
					updatedAt: data.updatedAt,
				},
			});
			return this.mapper.toDomain(updated);
		});
	}

	public async hasMenuItems(categoryId: string): Promise<boolean> {
		return this.run(async () => {
			const count = await this.prismaClient.menuItem.count({
				where: {
					categoryId,
					isDeleted: false,
				},
			});
			return count > 0;
		});
	}
}
