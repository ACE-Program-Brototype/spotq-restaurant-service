import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DomainError } from "@/domain/errors/domain.error";
import {
	RestaurantAlreadyExistsError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors";
import { RestaurantRepository } from "@/infrastructure/database/repositories/restaurant.repository";
import { PersistenceError } from "@/infrastructure/errors/persistence.error";

describe("RestaurantRepository", () => {
	let mockPrisma: {
		restaurant: {
			findUnique: jest.Mock;
			create: jest.Mock;
			update: jest.Mock;
			findMany: jest.Mock;
			count: jest.Mock;
			upsert: jest.Mock;
			findFirst: jest.Mock;
		};
		processedEvent: {
			findUnique: jest.Mock;
			create: jest.Mock;
		};
		$transaction: jest.Mock;
	};
	let repository: RestaurantRepository;

	beforeEach(() => {
		mockPrisma = {
			restaurant: {
				findUnique: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				findMany: jest.fn(),
				count: jest.fn(),
				upsert: jest.fn(),
				findFirst: jest.fn(),
			},
			processedEvent: {
				findUnique: jest.fn(),
				create: jest.fn(),
			},
			$transaction: jest.fn(),
		};
		repository = new RestaurantRepository(
			mockPrisma as unknown as PrismaClient,
		);
		jest.clearAllMocks();
	});

	describe("error translation via errorMap", () => {
		it("should translate P2002 error in create to RestaurantAlreadyExistsError", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed on the fields: (`email`)",
				{
					code: "P2002",
					clientVersion: "6.19.3",
				},
			);
			mockPrisma.restaurant.create.mockRejectedValueOnce(p2002Error);

			await expect(
				repository.create({
					restaurantName: "Test Restaurant",
					email: "existing@example.com",
					phone: "9876543210",
					ownerName: "John Doe",
					ownerEmail: "owner@example.com",
				}),
			).rejects.toThrow(RestaurantAlreadyExistsError);
		});

		it("should translate P2025 error in update to RestaurantNotFoundError", async () => {
			const p2025Error = new PrismaClientKnownRequestError(
				"Record to update not found",
				{
					code: "P2025",
					clientVersion: "6.19.3",
				},
			);
			mockPrisma.restaurant.update.mockRejectedValueOnce(p2025Error);

			await expect(
				repository.update("non-existent-id", {
					restaurantName: "Updated Name",
				}),
			).rejects.toThrow(RestaurantNotFoundError);
		});

		it("should wrap unmapped database error in PersistenceError", async () => {
			const dbError = new Error("Connection terminated unexpectedly");
			mockPrisma.restaurant.findUnique.mockRejectedValueOnce(dbError);

			await expect(
				repository.findByEmail("test@example.com"),
			).rejects.toThrow(PersistenceError);
		});

		it("RestaurantAlreadyExistsError should be an instance of DomainError", () => {
			const err = new RestaurantAlreadyExistsError();
			expect(err).toBeInstanceOf(DomainError);
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe("Restaurant with this email already exists");
		});
	});

	describe("activateSubscription", () => {
		it("should update restaurant and record processed event within transaction returning true", async () => {
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				const tx = {
					processedEvent: {
						findUnique: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockResolvedValue({ id: "evt-1" }),
					},
					restaurant: {
						update: jest.fn().mockResolvedValue({ id: "rest-1" }),
					},
				};
				return await callback(tx);
			});

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-1",
			);

			expect(result).toBe(true);
			expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
		});

		it("should return false if event was already processed inside transaction", async () => {
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				const tx = {
					processedEvent: {
						findUnique: jest.fn().mockResolvedValue({ id: "evt-already" }),
						create: jest.fn(),
					},
					restaurant: {
						update: jest.fn(),
					},
				};
				return await callback(tx);
			});

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-already",
			);

			expect(result).toBe(false);
		});

		it("should catch P2002 duplicate key constraint and return false idempotently", async () => {
			const p2002Error = new PrismaClientKnownRequestError(
				"Unique constraint failed on the fields: (`id`)",
				{
					code: "P2002",
					clientVersion: "6.19.3",
				},
			);

			mockPrisma.$transaction.mockRejectedValueOnce(p2002Error);

			const result = await repository.activateSubscription(
				"rest-1",
				"QUEUE_PRO",
				new Date("2026-10-01T00:00:00.000Z"),
				"evt-concurrent",
			);

			expect(result).toBe(false);
		});

		it("should rethrow unexpected database errors as PersistenceError", async () => {
			const dbError = new Error("Database connection failure");
			mockPrisma.$transaction.mockRejectedValueOnce(dbError);

			await expect(
				repository.activateSubscription(
					"rest-1",
					"QUEUE_PRO",
					new Date("2026-10-01T00:00:00.000Z"),
					"evt-err",
				),
			).rejects.toThrow("Database connection failure");
		});
	});
});
