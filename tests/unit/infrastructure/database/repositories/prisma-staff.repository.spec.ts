import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
	StaffAlreadyExistsError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import { PrismaStaffRepository } from "@/infrastructure/database/repositories/prisma-staff.repository.ts";

describe("PrismaStaffRepository", () => {
	let repository: PrismaStaffRepository;
	let mockStaffModel: {
		findUnique: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		upsert: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		update: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		delete: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
	};
	let mockPrismaClient: {
		staff: typeof mockStaffModel;
	};

	const mockRawStaff = {
		id: "staff-123",
		email: "test@example.com",
		fullname: "Test User",
		phone: "+1234567890",
		passwordHash: "hash123",
		avatarUrl: null,
		avatarUpdatedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		mockStaffModel = {
			findUnique: jest.fn(),
			findFirst: jest.fn(),
			upsert: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		mockPrismaClient = {
			staff: mockStaffModel,
		};

		repository = new PrismaStaffRepository(
			mockPrismaClient as unknown as PrismaClient,
		);
	});

	describe("findByEmail", () => {
		it("should return staff domain entity when staff exists", async () => {
			mockStaffModel.findUnique.mockResolvedValue(mockRawStaff);

			const result = await repository.findByEmail("test@example.com");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("staff-123");
			expect(result?.email).toBe("test@example.com");
			expect(mockStaffModel.findUnique).toHaveBeenCalledWith({
				where: { email: "test@example.com" },
			});
		});

		it("should return null when staff does not exist", async () => {
			mockStaffModel.findUnique.mockResolvedValue(null);

			const result = await repository.findByEmail("nonexistent@example.com");

			expect(result).toBeNull();
		});

		it("should return null when empty email is passed", async () => {
			const result = await repository.findByEmail("");
			expect(result).toBeNull();
			expect(mockStaffModel.findUnique).not.toHaveBeenCalled();
		});
	});

	describe("findById", () => {
		it("should return staff domain entity when found", async () => {
			mockStaffModel.findUnique.mockResolvedValue(mockRawStaff);

			const result = await repository.findById("staff-123");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("staff-123");
			expect(mockStaffModel.findUnique).toHaveBeenCalledWith({
				where: { id: "staff-123" },
			});
		});

		it("should return null when staff is not found", async () => {
			mockStaffModel.findUnique.mockResolvedValue(null);

			const result = await repository.findById("not-found");

			expect(result).toBeNull();
		});

		it("should return null when empty id is passed", async () => {
			const result = await repository.findById("");
			expect(result).toBeNull();
			expect(mockStaffModel.findUnique).not.toHaveBeenCalled();
		});
	});

	describe("handlePrismaError", () => {
		it("should throw StaffAlreadyExistsError on P2002 duplicate error", () => {
			const error = new PrismaClientKnownRequestError("Duplicate", {
				code: "P2002",
				clientVersion: "5.0.0",
			});

			const repoWithHandler = repository as unknown as {
				handlePrismaError: (err: unknown, ctx?: unknown) => void;
			};

			expect(() => repoWithHandler.handlePrismaError(error, "context")).toThrow(
				StaffAlreadyExistsError,
			);
		});

		it("should throw StaffNotFoundError on P2025 not found error", () => {
			const error = new PrismaClientKnownRequestError("Not found", {
				code: "P2025",
				clientVersion: "5.0.0",
			});

			const repoWithHandler = repository as unknown as {
				handlePrismaError: (err: unknown, ctx?: unknown) => void;
			};

			expect(() => repoWithHandler.handlePrismaError(error, "context")).toThrow(
				StaffNotFoundError,
			);
		});
	});
});
