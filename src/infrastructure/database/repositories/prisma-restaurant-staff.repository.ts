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
		const code = (error as { code?: string })?.code;
		if (
			code === "P2002" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		) {
			throw new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS);
		}
		if (
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2025")
		) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}
	}

	public async findByEmail(email: string): Promise<RestaurantStaff | null> {
		if (!email) {
			return null;
		}
		const raw = await this.dbModel.findFirst({
			where: { email: email.toLowerCase().trim() },
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async findByEmailAndRestaurantId(
		email: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null> {
		if (!email || !restaurantId) {
			return null;
		}
		const raw = await this.dbModel.findUnique({
			where: {
				restaurantId_email: {
					email: email.toLowerCase().trim(),
					restaurantId,
				},
			},
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<RestaurantStaff[]> {
		if (!restaurantId) {
			return [];
		}
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

	public async updateStatus(
		id: string,
		status: "ACTIVE" | "INACTIVE",
	): Promise<RestaurantStaff> {
		return this.update(id, {
			status,
			updatedAt: new Date(),
		});
	}

	public async updateStaffInfo(
		id: string,
		data: { fullname?: string; phone?: string },
	): Promise<RestaurantStaff> {
		const updateData: {
			fullname?: string;
			phone?: string;
			updatedAt?: Date;
		} = {};

		if (data.fullname !== undefined) {
			updateData.fullname = data.fullname;
		}
		if (data.phone !== undefined) {
			updateData.phone = data.phone;
		}
		updateData.updatedAt = new Date();

		return this.update(id, updateData);
	}
}
