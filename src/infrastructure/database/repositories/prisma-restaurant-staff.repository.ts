import { TYPES } from "@di/types.ts";
import type {
	Prisma,
	PrismaClient,
	RestaurantStaff as PrismaRestaurantStaff,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type {
	IRestaurantStaffRepository,
	StaffFilterParams,
} from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { StaffPersistenceMapper } from "../mappers/staff.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaRestaurantStaffRepository
	extends PrismaBaseRepository<
		RestaurantStaff,
		PrismaRestaurantStaff,
		PrismaClient["restaurantStaff"]
	>
	implements IRestaurantStaffRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma.restaurantStaff, StaffPersistenceMapper);
	}

	protected override handlePrismaError(
		error: unknown,
		_context?: unknown,
	): void {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS);
			}
			if (error.code === "P2025") {
				throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
			}
		}
	}

	public async findByEmail(email: string): Promise<RestaurantStaff | null> {
		const raw = await this.dbModel.findUnique({
			where: { email: email.toLowerCase().trim() },
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<RestaurantStaff[]> {
		const rawList = await this.dbModel.findMany({
			where: { restaurantId },
		});

		return rawList.map((raw) => this.mapper.toDomain(raw));
	}

	public async findManyWithFilters(
		params: StaffFilterParams,
	): Promise<{ staff: RestaurantStaff[]; total: number }> {
		const { restaurantId, page, limit, status, search, sortBy, sortOrder } =
			params;

		const where: Prisma.RestaurantStaffWhereInput = {
			restaurantId,
			...(status && { status }),
			...(search && {
				OR: [
					{ fullname: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const skip = (page - 1) * limit;

		const [rawList, total] = await Promise.all([
			this.dbModel.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			this.dbModel.count({ where }),
		]);

		return {
			staff: rawList.map((raw) => this.mapper.toDomain(raw)),
			total,
		};
	}

	public async findByIdAndRestaurantId(
		id: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null> {
		const raw = await this.dbModel.findFirst({
			where: {
				id,
				restaurantId,
			},
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}
}
