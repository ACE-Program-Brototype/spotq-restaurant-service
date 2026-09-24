import { TYPES } from "@di/types.ts";
import type { PrismaClient, Staff as PrismaStaff } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import type { Staff } from "@/domain/entities/staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IStaffRepository } from "@/domain/repositories/staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { StaffGlobalPersistenceMapper } from "../mappers/staff.mapper.ts";
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
		super(prisma.staff, StaffGlobalPersistenceMapper);
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

	public async findByEmail(email: string): Promise<Staff | null> {
		if (!email) {
			return null;
		}
		const raw = await this.dbModel.findUnique({
			where: { email: email.toLowerCase().trim() },
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public override async findById(id: string): Promise<Staff | null> {
		if (!id) {
			return null;
		}
		const raw = await this.dbModel.findUnique({
			where: { id },
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}
}
