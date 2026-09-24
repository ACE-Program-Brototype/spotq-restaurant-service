import type {
	Prisma,
	PrismaClient,
	StaffInvitation as PrismaStaffInvitation,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { StaffInvitation } from "@/domain/entities/staff-invitation.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffInvitationAlreadyPendingError,
} from "@/domain/errors/staff.errors.ts";
import type {
	IStaffInvitationRepository,
	StaffInvitationFilterParams,
} from "@/domain/repositories/staff-invitation.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { StaffInvitationPersistenceMapper } from "../mappers/staff-invitation.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaStaffInvitationRepository
	extends PrismaBaseRepository<
		StaffInvitation,
		PrismaStaffInvitation,
		PrismaClient["staffInvitation"]
	>
	implements IStaffInvitationRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prisma: PrismaClient,
	) {
		super(prisma.staffInvitation, StaffInvitationPersistenceMapper);
	}

	protected override handlePrismaError(
		error: unknown,
		_context?: unknown,
	): void {
		const code = (error as { code?: string })?.code;
		if (code === "P2002" || error instanceof PrismaClientKnownRequestError) {
			if (
				(error as PrismaClientKnownRequestError).code === "P2002" ||
				code === "P2002"
			) {
				throw new StaffInvitationAlreadyPendingError(
					messages.STAFF_INVITATION_ALREADY_PENDING,
				);
			}
		}
	}

	public async findByTokenHash(
		tokenHash: string,
	): Promise<StaffInvitation | null> {
		const raw = await this.dbModel.findUnique({
			where: { tokenHash },
		});

		if (!raw) {
			return null;
		}

		return this.mapper.toDomain(raw);
	}

	public async findByEmail(email: string): Promise<StaffInvitation[]> {
		const rawList = await this.dbModel.findMany({
			where: { email: email.toLowerCase().trim() },
		});

		return rawList.map((raw: PrismaStaffInvitation) =>
			this.mapper.toDomain(raw),
		);
	}

	public async findPendingByEmailAndRestaurant(
		email: string,
		restaurantId: string,
	): Promise<StaffInvitation | null> {
		const raw = await this.dbModel.findFirst({
			where: {
				email: email.toLowerCase().trim(),
				restaurantId,
				status: "PENDING",
				expiresAt: {
					gt: new Date(),
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
	): Promise<StaffInvitation[]> {
		const rawList = await this.dbModel.findMany({
			where: { restaurantId },
		});

		return rawList.map((raw: PrismaStaffInvitation) =>
			this.mapper.toDomain(raw),
		);
	}

	public async findManyWithFilters(
		params: StaffInvitationFilterParams,
	): Promise<{ invitations: StaffInvitation[]; total: number }> {
		const { restaurantId, page, limit, status, search, sortBy, sortOrder } =
			params;

		const where: Prisma.StaffInvitationWhereInput = {
			restaurantId,
			...(status && { status }),
			...(search && {
				email: {
					contains: search,
					mode: "insensitive",
				},
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
			invitations: rawList.map((raw: PrismaStaffInvitation) =>
				this.mapper.toDomain(raw),
			),
			total,
		};
	}

	public async createStaffWithInvitation(
		staff: RestaurantStaff,
		invitation: StaffInvitation,
	): Promise<void> {
		const invitationData =
			StaffInvitationPersistenceMapper.toPersistence(invitation);
		const {
			id: _invId,
			createdAt: _invCreatedAt,
			...invUpdateData
		} = invitationData;

		try {
			await this.prisma.$transaction(async (tx) => {
				const normalizedEmail = (staff.email || invitation.email)
					.toLowerCase()
					.trim();

				const globalStaff = await tx.staff.upsert({
					where: { email: normalizedEmail },
					create: {
						id: staff.staff?.id || staff.staffId || undefined,
						email: normalizedEmail,
						fullname: staff.fullname || staff.staff?.fullname || "",
						phone: staff.phone || staff.staff?.phone || "",
						passwordHash: staff.passwordHash || staff.staff?.passwordHash || "",
						avatarUrl: staff.avatarUrl || staff.staff?.avatarUrl || null,
					},
					update: {
						...(staff.fullname && { fullname: staff.fullname }),
						...(staff.phone && { phone: staff.phone }),
					},
				});
				const staffId = globalStaff.id;

				await tx.restaurantStaff.upsert({
					where: {
						staffId_restaurantId: {
							staffId,
							restaurantId: staff.restaurantId,
						},
					},
					create: {
						id: staff.id,
						staffId,
						restaurantId: staff.restaurantId,
						role: staff.role,
						status: staff.status,
						joinedAt: staff.joinedAt ?? new Date(),
						leftAt: staff.leftAt,
					},
					update: {
						status: staff.status,
						role: staff.role,
						leftAt: staff.leftAt,
						updatedAt: new Date(),
					},
				});

				await tx.staffInvitation.upsert({
					where: { id: invitation.id },
					create: invitationData,
					update: invUpdateData,
				});
			});
		} catch (error) {
			const code = (error as { code?: string })?.code;
			if (
				code === "P2002" ||
				(error instanceof PrismaClientKnownRequestError &&
					error.code === "P2002")
			) {
				throw new StaffAlreadyExistsError(messages.EMAIL_ALREADY_EXISTS);
			}
			throw error;
		}
	}
}
