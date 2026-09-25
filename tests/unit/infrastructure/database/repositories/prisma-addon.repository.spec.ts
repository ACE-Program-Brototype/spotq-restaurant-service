import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Addon } from "@/domain/entities/addon.entity.ts";
import { AddonAlreadyExistsError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { PrismaAddonRepository } from "@/infrastructure/database/repositories/prisma-addon.repository.ts";

describe("PrismaAddonRepository", () => {
	let mockPrisma: {
		addon: {
			create: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findUnique: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
	};
	let repository: PrismaAddonRepository;

	const now = new Date();
	const rawAddon = {
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		restaurantId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
		name: "Extra Cheese",
		description: "Creamy cheese",
		price: new Prisma.Decimal(50.0),
		imageKey: "addons/cheese.png",
		isAvailable: true,
		createdAt: now,
		updatedAt: now,
	};

	beforeEach(() => {
		mockPrisma = {
			addon: {
				create: jest.fn(),
				findUnique: jest.fn(),
				findFirst: jest.fn(),
				findMany: jest.fn(),
			},
		};

		repository = new PrismaAddonRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	it("should create an addon and return domain entity", async () => {
		mockPrisma.addon.create.mockResolvedValue(rawAddon);

		const domainEntity = Addon.create({
			restaurantId: rawAddon.restaurantId,
			name: rawAddon.name,
			description: rawAddon.description,
			price: 50.0,
			imageKey: rawAddon.imageKey,
		});

		const result = await repository.create(domainEntity);

		expect(result).toBeInstanceOf(Addon);
		expect(result.id).toBe(rawAddon.id);
		expect(result.name).toBe("Extra Cheese");
		expect(result.price).toBe(50.0);
	});

	it("should find addon by id", async () => {
		mockPrisma.addon.findUnique.mockResolvedValue(rawAddon);

		const result = await repository.findById(rawAddon.id);

		expect(result).toBeInstanceOf(Addon);
		expect(result?.id).toBe(rawAddon.id);
	});

	it("should return null if addon not found by id", async () => {
		mockPrisma.addon.findUnique.mockResolvedValue(null);

		const result = await repository.findById("non-existent");

		expect(result).toBeNull();
	});

	it("should find addon by name and restaurantId case-insensitively", async () => {
		mockPrisma.addon.findFirst.mockResolvedValue(rawAddon);

		const result = await repository.findByNameAndRestaurantId(
			"extra cheese",
			rawAddon.restaurantId,
		);

		expect(result).toBeInstanceOf(Addon);
		expect(mockPrisma.addon.findFirst).toHaveBeenCalledWith({
			where: {
				restaurantId: rawAddon.restaurantId,
				name: {
					equals: "extra cheese",
					mode: "insensitive",
				},
			},
		});
	});

	it("should find all addons by restaurantId", async () => {
		mockPrisma.addon.findMany.mockResolvedValue([rawAddon]);

		const results = await repository.findByRestaurantId(rawAddon.restaurantId);

		expect(results).toHaveLength(1);
		expect(results[0]).toBeInstanceOf(Addon);
		expect(mockPrisma.addon.findMany).toHaveBeenCalledWith({
			where: { restaurantId: rawAddon.restaurantId },
			orderBy: { name: "asc" },
		});
	});

	it("should map P2002 error to AddonAlreadyExistsError", async () => {
		const p2002Error = new PrismaClientKnownRequestError("Unique constraint", {
			code: "P2002",
			clientVersion: "6.0.0",
		});
		mockPrisma.addon.create.mockRejectedValue(p2002Error);

		const domainEntity = Addon.create({
			restaurantId: rawAddon.restaurantId,
			name: rawAddon.name,
			price: 50.0,
		});

		await expect(repository.create(domainEntity)).rejects.toThrow(
			AddonAlreadyExistsError,
		);
	});

	it("should map P2003 error to RestaurantNotFoundError", async () => {
		const p2003Error = new PrismaClientKnownRequestError(
			"Foreign key constraint",
			{
				code: "P2003",
				clientVersion: "6.0.0",
			},
		);
		mockPrisma.addon.create.mockRejectedValue(p2003Error);

		const domainEntity = Addon.create({
			restaurantId: rawAddon.restaurantId,
			name: rawAddon.name,
			price: 50.0,
		});

		await expect(repository.create(domainEntity)).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});
});
