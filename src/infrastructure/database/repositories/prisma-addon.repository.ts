import type { PrismaClient, Addon as PrismaAddon } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import { TYPES } from "@/config/di/types.ts";
import type { Addon } from "@/domain/entities/addon.entity.ts";
import { AddonAlreadyExistsError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";
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
		super(prisma.addon, AddonPersistenceMapper);
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
			throw new AddonAlreadyExistsError(messages.ADDON_ALREADY_EXISTS);
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
	): Promise<Addon | null> {
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

	public async findById(id: string): Promise<Addon | null> {
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

	public async findByRestaurantId(restaurantId: string): Promise<Addon[]> {
		try {
			const records = await this.dbModel.findMany({
				where: { restaurantId },
				orderBy: { name: "asc" },
			});
			return records.map((r) => this.mapper.toDomain(r));
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async create(addon: Addon): Promise<Addon> {
		try {
			const data = this.mapper.toPersistence(addon);
			const created = await this.dbModel.create({ data });
			return this.mapper.toDomain(created);
		} catch (error) {
			this.handlePrismaError(error, addon);
			throw error;
		}
	}
}
