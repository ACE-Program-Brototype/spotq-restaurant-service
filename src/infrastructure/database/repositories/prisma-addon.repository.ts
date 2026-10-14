import type { Addon as PrismaAddon, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type { Addon } from "@/domain/entities/addon.entity.ts";
import {
	AddonAlreadyExistsError,
	AddonNotFoundError,
} from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { PRISMA_ERROR_CODES } from "../constants/prisma-error-codes.constants.ts";
import { AddonPersistenceMapper } from "../mappers/addon.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaAddonRepository
	extends PrismaBaseRepository<Addon, PrismaAddon, PrismaClient["addon"]>
	implements IAddonRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma.addon, AddonPersistenceMapper, {
			[PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT]: () =>
				new AddonAlreadyExistsError(messages.ADDON_ALREADY_EXISTS),
			[PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT]: () =>
				new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND),
			[PRISMA_ERROR_CODES.RECORD_NOT_FOUND]: () =>
				new AddonNotFoundError(messages.ADDON_NOT_FOUND),
		});
	}

	public async findByNameAndRestaurantId(
		name: string,
		restaurantId: string,
	): Promise<Addon | null> {
		return this.run(async () => {
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
		});
	}

	public async findByRestaurantId(restaurantId: string): Promise<Addon[]> {
		return this.run(async () => {
			const records = await this.dbModel.findMany({
				where: {
					restaurantId,
					isDeleted: false,
				},
				orderBy: { name: "asc" },
			});
			return records.map((r) => this.mapper.toDomain(r));
		});
	}

	public async findByIdsAndRestaurantId(
		ids: string[],
		restaurantId: string,
	): Promise<Addon[]> {
		return this.run(async () => {
			if (ids.length === 0) return [];
			const records = await this.dbModel.findMany({
				where: {
					id: { in: ids },
					restaurantId,
					isDeleted: false,
				},
			});
			return records.map((r) => this.mapper.toDomain(r));
		});
	}

	public async create(addon: Addon): Promise<Addon> {
		return this.run(async () => {
			const data = this.mapper.toPersistence(addon);
			const created = await this.dbModel.create({ data });
			return this.mapper.toDomain(created);
		});
	}

	public async updateAddon(addon: Addon): Promise<Addon> {
		return this.run(async () => {
			const data = this.mapper.toPersistence(addon);
			const updated = await this.dbModel.update({
				where: { id: data.id },
				data: {
					name: data.name,
					description: data.description,
					price: data.price,
					imageKey: data.imageKey,
					isAvailable: data.isAvailable,
					isDeleted: data.isDeleted,
				},
			});
			return this.mapper.toDomain(updated);
		});
	}
}
