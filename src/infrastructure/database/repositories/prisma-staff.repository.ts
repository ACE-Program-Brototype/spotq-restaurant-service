import { TYPES } from "@di/types.ts";
import type { PrismaClient, Staff as PrismaStaff } from "@prisma/client";
import { inject, injectable } from "inversify";
import type { Staff } from "@/domain/entities/staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffRepository } from "@/domain/repositories/staff.repository.interface.ts";
import { StaffGlobalPersistenceMapper } from "@/infrastructure/database/mappers/staff.mapper.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaStaffRepository
	extends PrismaBaseRepository<Staff, PrismaStaff, PrismaClient["staff"]>
	implements IStaffRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma.staff, StaffGlobalPersistenceMapper, {
			P2002: () => new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS),
			P2025: () => new StaffNotFoundError(messages.STAFF_NOT_FOUND),
		});
	}

	public async findByEmail(email: string): Promise<Staff | null> {
		if (!email) {
			return null;
		}
		return this.run(async () => {
			const raw = await this.dbModel.findUnique({
				where: { email: email.toLowerCase().trim() },
			});

			if (!raw) {
				return null;
			}

			return this.mapper.toDomain(raw);
		});
	}

	public override async findById(id: string): Promise<Staff | null> {
		if (!id) {
			return null;
		}
		return super.findById(id);
	}
}
