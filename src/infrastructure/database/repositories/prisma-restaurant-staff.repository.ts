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
		context?: unknown,
	): void {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				const email = (context as RestaurantStaff)?.email ?? "with this email";
				throw new StaffAlreadyExistsError(
					`Staff with email ${email} already exists`,
				);
			}
			if (error.code === "P2025") {
				const id =
					typeof context === "string"
						? context
						: ((context as RestaurantStaff)?.id ?? "");
				throw new StaffNotFoundError(`Staff member with id ${id} not found`);
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
}
