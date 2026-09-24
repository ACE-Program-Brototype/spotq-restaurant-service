import type {
	PrismaClient,
	MenuCategory as PrismaMenuCategory,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import { CategoryAlreadyExistsError } from "@/domain/errors/menu-category.errors.ts";
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
	implements IMenuCategoryRepository, IMenuCategoryRepositoryPort
{
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prismaClient: PrismaClient,
	) {
		super(prismaClient.menuCategory, MenuCategoryPersistenceMapper);
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
			throw new CategoryAlreadyExistsError(messages.CATEGORY_ALREADY_EXISTS);
		}
		if (
			code === "P2003" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2003")
		) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}
	}

	public async findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
	): Promise<MenuCategory | null> {
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

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<MenuCategory[]> {
		try {
			const records = await this.dbModel.findMany({
				where: { restaurantId },
				orderBy: { displayOrder: "asc" },
			});
			return records.map((record) => this.mapper.toDomain(record));
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async getNextDisplayOrder(restaurantId: string): Promise<number> {
		try {
			const last = await this.dbModel.findFirst({
				where: { restaurantId },
				orderBy: { displayOrder: "desc" },
				select: { displayOrder: true },
			});
			return last ? last.displayOrder + 1 : 0;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async create(category: MenuCategory): Promise<MenuCategory> {
		try {
			const data = this.mapper.toPersistence(category);
			const created = await this.prismaClient.$transaction(async (tx) => {
				await tx.menuCategory.updateMany({
					where: {
						restaurantId: data.restaurantId,
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
		} catch (error) {
			this.handlePrismaError(error, category);
			throw error;
		}
	}
}
