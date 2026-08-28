import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import { TYPES } from "@/config/di/types.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

@injectable()
export class PrismaRestaurantStaffRepository
	implements IRestaurantStaffRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	public async findById(id: string): Promise<RestaurantStaff | null> {
		const raw = await this.prisma.restaurantStaff.findUnique({
			where: { id },
		});

		if (!raw) {
			return null;
		}

		return StaffMapper.toDomain(raw);
	}

	public async findByEmail(email: string): Promise<RestaurantStaff | null> {
		const raw = await this.prisma.restaurantStaff.findUnique({
			where: { email: email.toLowerCase().trim() },
		});

		if (!raw) {
			return null;
		}

		return StaffMapper.toDomain(raw);
	}

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<RestaurantStaff[]> {
		const rawList = await this.prisma.restaurantStaff.findMany({
			where: { restaurantId },
		});

		return rawList.map((raw) => StaffMapper.toDomain(raw));
	}

	public async save(staff: RestaurantStaff): Promise<void> {
		try {
			await this.prisma.restaurantStaff.upsert({
				where: { id: staff.id },
				update: {
					fullname: staff.fullname,
					email: staff.email,
					phone: staff.phone,
					avatarUrl: staff.avatarUrl,
					passwordHash: staff.passwordHash,
					role: staff.role,
					status: staff.status,
					updatedAt: staff.updatedAt,
				},
				create: {
					id: staff.id,
					restaurantId: staff.restaurantId,
					fullname: staff.fullname,
					email: staff.email,
					phone: staff.phone,
					avatarUrl: staff.avatarUrl,
					passwordHash: staff.passwordHash,
					role: staff.role,
					status: staff.status,
					createdAt: staff.createdAt,
					updatedAt: staff.updatedAt,
				},
			});
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new StaffAlreadyExistsError(
					`Staff with email ${staff.email} already exists`,
				);
			}
			throw error;
		}
	}

	public async update(staff: RestaurantStaff): Promise<void> {
		try {
			await this.prisma.restaurantStaff.update({
				where: { id: staff.id },
				data: {
					fullname: staff.fullname,
					phone: staff.phone,
					avatarUrl: staff.avatarUrl,
					passwordHash: staff.passwordHash,
					role: staff.role,
					status: staff.status,
					updatedAt: staff.updatedAt,
				},
			});
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				throw new StaffNotFoundError(
					`Staff member with id ${staff.id} not found`,
				);
			}
			throw error;
		}
	}

	public async delete(id: string): Promise<void> {
		try {
			await this.prisma.restaurantStaff.delete({
				where: { id },
			});
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				throw new StaffNotFoundError(`Staff member with id ${id} not found`);
			}
			throw error;
		}
	}
}
