import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type {
	PrismaClient,
	StaffInvitation as PrismaStaffInvitation,
} from "@prisma/client";
import { PrismaStaffInvitationRepository } from "@/infrastructure/database/repositories/prisma-staff-invitation.repository.ts";

describe("PrismaStaffInvitationRepository", () => {
	let mockPrisma: {
		staffInvitation: {
			findUnique: jest.Mock;
			findFirst: jest.Mock;
			findMany: jest.Mock;
			upsert: jest.Mock;
			count: jest.Mock;
			delete: jest.Mock;
		};
		restaurantStaff: {
			upsert: jest.Mock;
		};
		$transaction: jest.Mock;
	};
	let repository: PrismaStaffInvitationRepository;

	const now = new Date();
	const dummyPrismaInvitation: PrismaStaffInvitation = {
		id: "inv-123",
		restaurantId: "rest-123",
		email: "john@example.com",
		tokenHash: "token_hash_123",
		status: "PENDING",
		expiresAt: new Date(Date.now() + 86400000),
		acceptedAt: null,
		createdAt: now,
		updatedAt: now,
	};

	beforeEach(() => {
		mockPrisma = {
			staffInvitation: {
				findUnique: jest.fn(),
				findFirst: jest.fn(),
				findMany: jest.fn(),
				upsert: jest.fn(),
				count: jest.fn(),
				delete: jest.fn(),
			},
			restaurantStaff: {
				upsert: jest.fn(),
			},
			$transaction: jest.fn(),
		};

		repository = new PrismaStaffInvitationRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	describe("findManyWithFilters", () => {
		it("should query findMany and count with filters and return mapped domain entities", async () => {
			mockPrisma.staffInvitation.findMany.mockResolvedValue([
				dummyPrismaInvitation,
			]);
			mockPrisma.staffInvitation.count.mockResolvedValue(1);

			const result = await repository.findManyWithFilters({
				restaurantId: "rest-123",
				page: 1,
				limit: 10,
				status: "PENDING",
				search: "john",
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			expect(mockPrisma.staffInvitation.findMany).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: "PENDING",
					email: {
						contains: "john",
						mode: "insensitive",
					},
				},
				orderBy: { createdAt: "desc" },
				skip: 0,
				take: 10,
			});
			expect(mockPrisma.staffInvitation.count).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: "PENDING",
					email: {
						contains: "john",
						mode: "insensitive",
					},
				},
			});

			expect(result.total).toBe(1);
			expect(result.invitations).toHaveLength(1);
			expect(result.invitations[0].id).toBe("inv-123");
			expect(result.invitations[0].email).toBe("john@example.com");
		});
	});
});
