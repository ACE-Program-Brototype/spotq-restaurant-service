import type {
	PrismaClient,
	RestaurantStaff as PrismaStaff,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import { PrismaRestaurantStaffRepository } from "@/infrastructure/database/repositories/prisma-restaurant-staff.repository.ts";

describe("PrismaRestaurantStaffRepository", () => {
	let mockPrisma: {
		restaurantStaff: {
			findUnique: jest.Mock;
			findMany: jest.Mock;
			upsert: jest.Mock;
			update: jest.Mock;
			delete: jest.Mock;
			count: jest.Mock;
		};
	};
	let repository: PrismaRestaurantStaffRepository;

	const now = new Date();
	const dummyPrismaStaff: PrismaStaff = {
		id: "staff-123",
		restaurantId: "rest-123",
		fullname: "John Doe",
		email: "john@example.com",
		phone: "9876543210",
		avatarUrl: null,
		passwordHash: "hashed_pwd",
		role: "STAFF",
		status: "ACTIVE",
		createdAt: now,
		updatedAt: now,
	};

	const dummyStaff = RestaurantStaff.reconstitute({
		id: "staff-123",
		restaurantId: "rest-123",
		fullname: "John Doe",
		email: "john@example.com",
		phone: "9876543210",
		avatarUrl: null,
		passwordHash: "hashed_pwd",
		role: "STAFF",
		status: "ACTIVE",
		createdAt: now,
		updatedAt: now,
	});

	beforeEach(() => {
		mockPrisma = {
			restaurantStaff: {
				findUnique: jest.fn(),
				findMany: jest.fn(),
				upsert: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
				count: jest.fn(),
			},
		};
		repository = new PrismaRestaurantStaffRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	describe("findById", () => {
		it("should find and map staff to domain entity", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(dummyPrismaStaff);

			const result = await repository.findById("staff-123");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("staff-123");
			expect(result?.email).toBe("john@example.com");
		});

		it("should return null if staff not found", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(null);

			const result = await repository.findById("unknown");

			expect(result).toBeNull();
		});
	});

	describe("findByEmail", () => {
		it("should find staff by lowercased email", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(dummyPrismaStaff);

			const result = await repository.findByEmail("JOHN@EXAMPLE.COM");

			expect(mockPrisma.restaurantStaff.findUnique).toHaveBeenCalledWith({
				where: { email: "john@example.com" },
			});
			expect(result?.email).toBe("john@example.com");
		});

		it("should return null if staff with email does not exist", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(null);

			const result = await repository.findByEmail("unknown@example.com");

			expect(result).toBeNull();
		});
	});

	describe("findByRestaurantId", () => {
		it("should return list of staff in a restaurant", async () => {
			mockPrisma.restaurantStaff.findMany.mockResolvedValue([dummyPrismaStaff]);

			const result = await repository.findByRestaurantId("rest-123");

			expect(result).toHaveLength(1);
			expect(result[0].restaurantId).toBe("rest-123");
		});
	});

	describe("save", () => {
		it("should upsert staff entity", async () => {
			mockPrisma.restaurantStaff.upsert.mockResolvedValue(dummyPrismaStaff);

			await repository.save(dummyStaff);

			expect(mockPrisma.restaurantStaff.upsert).toHaveBeenCalledWith({
				where: { id: "staff-123" },
				update: expect.objectContaining({
					fullname: "John Doe",
					phone: "9876543210",
				}),
				create: expect.objectContaining({
					id: "staff-123",
					restaurantId: "rest-123",
					email: "john@example.com",
				}),
			});
		});

		it("should throw StaffAlreadyExistsError when P2002 duplicate occurs", async () => {
			const error = new PrismaClientKnownRequestError("Duplicate", {
				code: "P2002",
				clientVersion: "5.0.0",
			});
			mockPrisma.restaurantStaff.upsert.mockRejectedValue(error);

			await expect(repository.save(dummyStaff)).rejects.toThrow(
				StaffAlreadyExistsError,
			);
		});
	});

	describe("delete", () => {
		it("should delete staff by id", async () => {
			mockPrisma.restaurantStaff.delete.mockResolvedValue(dummyPrismaStaff);

			await repository.delete("staff-123");

			expect(mockPrisma.restaurantStaff.delete).toHaveBeenCalledWith({
				where: { id: "staff-123" },
			});
		});

		it("should throw StaffNotFoundError on delete P2025 error", async () => {
			const error = new PrismaClientKnownRequestError("Not found", {
				code: "P2025",
				clientVersion: "5.0.0",
			});
			mockPrisma.restaurantStaff.delete.mockRejectedValue(error);

			await expect(repository.delete("staff-123")).rejects.toThrow(
				StaffNotFoundError,
			);
		});
	});
});
