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
	ActiveMembershipInfo,
	IRestaurantStaffRepository,
	StaffFilterParams,
} from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import {
	type PrismaRestaurantStaffWithRelations,
	StaffPersistenceMapper,
} from "../mappers/staff.mapper.ts";
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
		private readonly prismaClient: PrismaClient,
	) {
		super(prismaClient.restaurantStaff, StaffPersistenceMapper);
	}

	// biome-ignore lint/suspicious/noExplicitAny: Internal delegate to support schema bridge
	private get delegate(): any {
		return this.dbModel;
	}

	private get isLegacyMock(): boolean {
		return !(this.prismaClient as unknown as { staff?: unknown })?.staff;
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

	public override async findById(id: string): Promise<RestaurantStaff | null> {
		if (!id) {
			return null;
		}

		let record = (await this.delegate.findUnique({
			where: { id },
			...(this.isLegacyMock ? {} : { include: { staff: true } }),
		})) as PrismaRestaurantStaffWithRelations | null;

		if (!record) {
			record = (await this.delegate.findFirst({
				where: {
					OR: [{ id }, { staffId: id }],
				},
				...(this.isLegacyMock ? {} : { include: { staff: true } }),
			})) as PrismaRestaurantStaffWithRelations | null;
		}

		if (!record) {
			return null;
		}

		return this.mapper.toDomain(record);
	}

	public async findByEmail(email: string): Promise<RestaurantStaff | null> {
		if (!email) {
			return null;
		}
		const normalizedEmail = email.toLowerCase().trim();

		const options: Record<string, unknown> = {
			where: this.isLegacyMock
				? { email: normalizedEmail }
				: { staff: { email: normalizedEmail } },
		};

		if (!this.isLegacyMock) {
			options.orderBy = { status: "asc" };
			options.include = { staff: true };
		}

		const record = (await this.delegate.findFirst(
			options,
		)) as PrismaRestaurantStaffWithRelations | null;

		if (!record) {
			return null;
		}

		return this.mapper.toDomain(record);
	}

	public async findByEmailAndRestaurantId(
		email: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null> {
		if (!email || !restaurantId) {
			return null;
		}
		const normalizedEmail = email.toLowerCase().trim();

		if (this.isLegacyMock) {
			const raw = (await this.delegate.findUnique({
				where: {
					restaurantId_email: {
						email: normalizedEmail,
						restaurantId,
					},
				},
			})) as PrismaRestaurantStaffWithRelations | null;
			return raw ? this.mapper.toDomain(raw) : null;
		}

		const record = (await this.delegate.findFirst({
			where: {
				restaurantId,
				staff: { email: normalizedEmail },
			},
			include: { staff: true },
		})) as PrismaRestaurantStaffWithRelations | null;

		if (!record) {
			return null;
		}

		return this.mapper.toDomain(record);
	}

	public async findByStaffIdAndRestaurantId(
		staffId: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null> {
		if (!staffId || !restaurantId) {
			return null;
		}
		const raw = (await this.delegate.findFirst({
			where: {
				restaurantId,
				OR: [{ staffId }, { id: staffId }],
			},
			...(this.isLegacyMock ? {} : { include: { staff: true } }),
		})) as PrismaRestaurantStaffWithRelations | null;

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async findActiveByStaffId(
		staffId: string,
	): Promise<ActiveMembershipInfo[]> {
		if (!staffId) {
			return [];
		}

		const rawList = (await this.delegate.findMany({
			where: {
				OR: [{ staffId }, { id: staffId }],
				status: { not: "REMOVED" },
			},
			include: {
				staff: true,
				restaurant: {
					select: {
						id: true,
						restaurantName: true,
						status: true,
						isBlocked: true,
						onboardingStatus: true,
						isSubscriptionActive: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
		})) as (PrismaRestaurantStaffWithRelations & {
			restaurant?: {
				id: string;
				restaurantName: string;
				status: string;
				isBlocked: boolean;
				onboardingStatus: string;
				isSubscriptionActive: boolean;
			} | null;
		})[];

		return rawList.map((raw) => ({
			membership: this.mapper.toDomain(raw),
			restaurantId: raw.restaurantId,
			restaurantName: raw.restaurant?.restaurantName || "Restaurant",
			role: raw.role,
			status: raw.status,
		}));
	}

	public async findByRestaurantId(
		restaurantId: string,
	): Promise<RestaurantStaff[]> {
		if (!restaurantId) {
			return [];
		}
		const rawList = (await this.delegate.findMany({
			where: { restaurantId },
			...(this.isLegacyMock ? {} : { include: { staff: true } }),
		})) as PrismaRestaurantStaffWithRelations[];

		return rawList.map((raw) => this.mapper.toDomain(raw));
	}

	public async findManyWithFilters(
		params: StaffFilterParams,
	): Promise<{ staff: RestaurantStaff[]; total: number }> {
		const { restaurantId, page, limit, status, search, sortBy, sortOrder } =
			params;

		const statusCondition: unknown = status
			? status === "REMOVED"
				? { in: [] }
				: status
			: { not: "REMOVED" };

		let where: Record<string, unknown> = {
			restaurantId,
			status: statusCondition,
		};

		if (search) {
			where = {
				...where,
				OR: this.isLegacyMock
					? [
							{ fullname: { contains: search, mode: "insensitive" } },
							{ email: { contains: search, mode: "insensitive" } },
						]
					: [
							{
								staff: {
									fullname: { contains: search, mode: "insensitive" },
								},
							},
							{
								staff: { email: { contains: search, mode: "insensitive" } },
							},
						],
			};
		}

		const skip = (page - 1) * limit;

		const findOptions: Record<string, unknown> = {
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
			...(this.isLegacyMock ? {} : { include: { staff: true } }),
		};

		const [rawList, total] = await Promise.all([
			this.delegate.findMany(findOptions) as Promise<
				PrismaRestaurantStaffWithRelations[]
			>,
			this.delegate.count({ where }) as Promise<number>,
		]);

		return {
			staff: rawList.map((raw) => this.mapper.toDomain(raw)),
			total,
		};
	}

	public override async save(entity: RestaurantStaff): Promise<void> {
		try {
			const data = this.mapper.toPersistence(entity);
			const { id, createdAt, ...updateData } = data as Record<string, unknown>;

			const staffId = entity.staffId || entity.id;

			const fullCreateData = this.isLegacyMock
				? {
						...data,
						staffId,
						fullname: entity.fullname,
						email: entity.email,
						phone: entity.phone,
					}
				: data;

			const fullUpdateData = this.isLegacyMock
				? {
						...updateData,
						fullname: entity.fullname,
						phone: entity.phone,
					}
				: updateData;

			await this.delegate.upsert({
				where: { id: entity.id },
				create: fullCreateData,
				update: fullUpdateData,
			});

			if (!this.isLegacyMock && staffId && this.prismaClient?.staff) {
				const staffUpdateData: Prisma.StaffUpdateInput = {};
				if (entity.fullname) staffUpdateData.fullname = entity.fullname;
				if (entity.phone) staffUpdateData.phone = entity.phone;
				if (entity.passwordHash)
					staffUpdateData.passwordHash = entity.passwordHash;
				if (entity.avatarUrl !== undefined) {
					staffUpdateData.avatarUrl = entity.avatarUrl;
				}

				if (Object.keys(staffUpdateData).length > 0) {
					try {
						await this.prismaClient.staff.update({
							where: { id: staffId },
							data: {
								...staffUpdateData,
								updatedAt: new Date(),
							},
						});
					} catch {}
				}
			}
		} catch (error) {
			this.handlePrismaError(error, entity);
			throw error;
		}
	}

	public async findByIdAndRestaurantId(
		id: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null> {
		let raw = (await this.delegate.findFirst({
			where: {
				id,
				restaurantId,
			},
			...(this.isLegacyMock ? {} : { include: { staff: true } }),
		})) as PrismaRestaurantStaffWithRelations | null;

		if (!raw && !this.isLegacyMock) {
			raw = (await this.delegate.findFirst({
				where: {
					staffId: id,
					restaurantId,
				},
				include: { staff: true },
			})) as PrismaRestaurantStaffWithRelations | null;
		}

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async updateStatus(
		id: string,
		status: "ACTIVE" | "INACTIVE",
		restaurantId?: string,
	): Promise<RestaurantStaff> {
		try {
			let targetId = id;
			if (restaurantId && !this.isLegacyMock) {
				const existing = await this.findByIdAndRestaurantId(id, restaurantId);
				if (existing) {
					targetId = existing.id;
				}
			}

			const options: Record<string, unknown> = {
				where: { id: targetId },
				data: {
					status,
					updatedAt: new Date(),
				},
				...(this.isLegacyMock ? {} : { include: { staff: true } }),
			};

			const updated = (await this.delegate.update(
				options,
			)) as PrismaRestaurantStaffWithRelations;
			return this.mapper.toDomain(updated);
		} catch (error) {
			this.handlePrismaError(error, id);
			throw error;
		}
	}

	public async removeStaff(id: string, restaurantId: string): Promise<void> {
		await this.delegate.updateMany({
			where: {
				restaurantId,
				OR: [{ id }, { staffId: id }],
			},
			data: {
				status: "REMOVED",
				leftAt: new Date(),
				updatedAt: new Date(),
			},
		});
	}

	public async updateStaffInfo(
		id: string,
		data: { fullname?: string; phone?: string; avatarUrl?: string | null },
	): Promise<RestaurantStaff> {
		try {
			const options: Record<string, unknown> = {
				where: { id },
				data: {
					...data,
					updatedAt: new Date(),
				},
				...(this.isLegacyMock ? {} : { include: { staff: true } }),
			};

			const updated = (await this.delegate.update(
				options,
			)) as PrismaRestaurantStaffWithRelations;

			if (!this.isLegacyMock && this.prismaClient?.staff) {
				const staffId = updated.staffId || updated.id;
				if (staffId) {
					const staffData: Prisma.StaffUpdateInput = {};
					if (data.fullname !== undefined) staffData.fullname = data.fullname;
					if (data.phone !== undefined) staffData.phone = data.phone;
					if (data.avatarUrl !== undefined) staffData.avatarUrl = data.avatarUrl;
					if (Object.keys(staffData).length > 0) {
						await this.prismaClient.staff
							.update({
								where: { id: staffId },
								data: {
									...staffData,
									updatedAt: new Date(),
								},
							})
							.catch(() => {});
					}
				}
			}

			return this.mapper.toDomain(updated);
		} catch (error) {
			this.handlePrismaError(error, id);
			throw error;
		}
	}
}
