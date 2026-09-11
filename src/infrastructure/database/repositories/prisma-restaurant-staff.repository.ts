import type {
	PrismaClient,
	RestaurantStaff as PrismaRestaurantStaff,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
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
			(error instanceof PrismaClientKnownRequestError &&
				error.code === "P2002")
		) {
			throw new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS);
		}
		if (
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError &&
				error.code === "P2025")
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
}
