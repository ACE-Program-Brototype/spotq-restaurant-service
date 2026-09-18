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
			findFirst: jest.Mock;
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
		phone: "+919876543210",
		avatarUpdatedAt: null,
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
		phone: "+919876543210",
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
				findFirst: jest.fn(),
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
			mockPrisma.restaurantStaff.findFirst.mockResolvedValue(dummyPrismaStaff);

			const result = await repository.findByEmail("JOHN@EXAMPLE.COM");

			expect(mockPrisma.restaurantStaff.findFirst).toHaveBeenCalledWith({
				where: { email: "john@example.com" },
			});
			expect(result?.email).toBe("john@example.com");
		});

		it("should return null if staff with email does not exist", async () => {
			mockPrisma.restaurantStaff.findFirst.mockResolvedValue(null);

			const result = await repository.findByEmail("unknown@example.com");

			expect(result).toBeNull();
		});
	});

	describe("findByEmailAndRestaurantId", () => {
		it("should find staff by email and restaurantId", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(dummyPrismaStaff);

			const result = await repository.findByEmailAndRestaurantId(
				"JOHN@EXAMPLE.COM",
				"rest-123",
			);

			expect(mockPrisma.restaurantStaff.findUnique).toHaveBeenCalledWith({
				where: {
					restaurantId_email: {
						email: "john@example.com",
						restaurantId: "rest-123",
					},
				},
			});
			expect(result?.email).toBe("john@example.com");
			expect(result?.restaurantId).toBe("rest-123");
		});

		it("should return null if staff with email and restaurantId does not exist", async () => {
			mockPrisma.restaurantStaff.findUnique.mockResolvedValue(null);

			const result = await repository.findByEmailAndRestaurantId(
				"unknown@example.com",
				"rest-123",
			);

			expect(result).toBeNull();
		});

		it("should return null if email or restaurantId is empty", async () => {
			const result = await repository.findByEmailAndRestaurantId(
				"",
				"rest-123",
			);
			expect(result).toBeNull();
			expect(mockPrisma.restaurantStaff.findUnique).not.toHaveBeenCalled();
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

	describe("findManyWithFilters", () => {
		it("should exclude REMOVED status by default when listing staff", async () => {
			mockPrisma.restaurantStaff.findMany.mockResolvedValue([dummyPrismaStaff]);
			mockPrisma.restaurantStaff.count.mockResolvedValue(1);

			const result = await repository.findManyWithFilters({
				restaurantId: "rest-123",
				page: 1,
				limit: 10,
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			expect(mockPrisma.restaurantStaff.findMany).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: { not: "REMOVED" },
				},
				orderBy: { createdAt: "desc" },
				skip: 0,
				take: 10,
			});
			expect(mockPrisma.restaurantStaff.count).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: { not: "REMOVED" },
				},
			});
			expect(result.staff).toHaveLength(1);
			expect(result.total).toBe(1);
		});

		it("should filter by specific status when provided", async () => {
			mockPrisma.restaurantStaff.findMany.mockResolvedValue([dummyPrismaStaff]);
			mockPrisma.restaurantStaff.count.mockResolvedValue(1);

			await repository.findManyWithFilters({
				restaurantId: "rest-123",
				page: 1,
				limit: 10,
				status: "ACTIVE",
				sortBy: "createdAt",
				sortOrder: "asc",
			});

			expect(mockPrisma.restaurantStaff.findMany).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: "ACTIVE",
				},
				orderBy: { createdAt: "asc" },
				skip: 0,
				take: 10,
			});
		});

		it("should exclude all records when status is REMOVED", async () => {
			mockPrisma.restaurantStaff.findMany.mockResolvedValue([]);
			mockPrisma.restaurantStaff.count.mockResolvedValue(0);

			await repository.findManyWithFilters({
				restaurantId: "rest-123",
				page: 1,
				limit: 10,
				status: "REMOVED",
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			expect(mockPrisma.restaurantStaff.findMany).toHaveBeenCalledWith({
				where: {
					restaurantId: "rest-123",
					status: { in: [] },
				},
				orderBy: { createdAt: "desc" },
				skip: 0,
				take: 10,
			});
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
					phone: "+919876543210",
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

	describe("findByIdAndRestaurantId", () => {
		it("should find and map staff by id and restaurantId", async () => {
			mockPrisma.restaurantStaff.findFirst.mockResolvedValue(dummyPrismaStaff);

			const result = await repository.findByIdAndRestaurantId(
				"staff-123",
				"rest-123",
			);

			expect(mockPrisma.restaurantStaff.findFirst).toHaveBeenCalledWith({
				where: {
					id: "staff-123",
					restaurantId: "rest-123",
				},
			});
			expect(result).not.toBeNull();
			expect(result?.id).toBe("staff-123");
			expect(result?.restaurantId).toBe("rest-123");
		});

		it("should return null if staff with id and restaurantId not found", async () => {
			mockPrisma.restaurantStaff.findFirst.mockResolvedValue(null);

			const result = await repository.findByIdAndRestaurantId(
				"staff-123",
				"other-rest",
			);

			expect(result).toBeNull();
		});
	});

	describe("updateStatus", () => {
		it("should update and map staff status", async () => {
			const updatedPrismaStaff: PrismaStaff = {
				...dummyPrismaStaff,
				status: "INACTIVE",
				updatedAt: new Date(),
			};
			mockPrisma.restaurantStaff.update.mockResolvedValue(updatedPrismaStaff);

			const result = await repository.updateStatus("staff-123", "INACTIVE");

			expect(mockPrisma.restaurantStaff.update).toHaveBeenCalledWith({
				where: { id: "staff-123" },
				data: expect.objectContaining({
					status: "INACTIVE",
					updatedAt: expect.any(Date),
				}),
			});
			expect(result.status).toBe("INACTIVE");
		});
	});

	describe("updateStaffInfo", () => {
		it("should update staff fullname and phone and return updated entity", async () => {
			const updatedPrisma = {
				...dummyPrismaStaff,
				fullname: "Updated Name",
				phone: "+919999999999",
				updatedAt: new Date(),
			};
			mockPrisma.restaurantStaff.update.mockResolvedValue(updatedPrisma);

			const result = await repository.updateStaffInfo("staff-123", {
				fullname: "Updated Name",
				phone: "+919999999999",
			});

			expect(result.fullname).toBe("Updated Name");
			expect(result.phone).toBe("+919999999999");
			expect(mockPrisma.restaurantStaff.update).toHaveBeenCalledWith({
				where: { id: "staff-123" },
				data: expect.objectContaining({
					fullname: "Updated Name",
					phone: "+919999999999",
					updatedAt: expect.any(Date),
				}),
			});
		});

		it("should throw StaffNotFoundError when P2025 error occurs during update", async () => {
			const error = new PrismaClientKnownRequestError("Record not found", {
				code: "P2025",
				clientVersion: "5.0.0",
			});
			mockPrisma.restaurantStaff.update.mockRejectedValue(error);

			await expect(
				repository.updateStaffInfo("staff-nonexistent", {
					fullname: "Updated Name",
				}),
			).rejects.toThrow(StaffNotFoundError);
		});
	});
});
