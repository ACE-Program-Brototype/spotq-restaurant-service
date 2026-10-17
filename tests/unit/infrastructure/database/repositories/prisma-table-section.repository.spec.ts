import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { PrismaClient } from "@prisma/client";
import { TableSection } from "@/domain/entities/table-section.entity.ts";
import { PrismaTableSectionRepository } from "@/infrastructure/database/repositories/prisma-table-section.repository.ts";

describe("PrismaTableSectionRepository", () => {
	let mockPrisma: {
		tableSection: {
			create: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findUnique: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findFirst: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			findMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
			update: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
		};
	};
	let repository: PrismaTableSectionRepository;
	const now = new Date("2026-01-01T00:00:00Z");
	const rawSection = {
		id: "section-1",
		restaurantId: "restaurant-1",
		sectionName: "Patio",
		createdAt: now,
		updatedAt: now,
		isDeleted: false,
	};

	beforeEach(() => {
		mockPrisma = {
			tableSection: {
				create: jest.fn(),
				findUnique: jest.fn(),
				findFirst: jest.fn(),
				findMany: jest.fn(),
				count: jest.fn(),
				update: jest.fn(),
			},
		};
		repository = new PrismaTableSectionRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	it("returns all active sections for a restaurant in name order", async () => {
		mockPrisma.tableSection.findMany.mockResolvedValue([rawSection]);
		const result = await repository.findAllByRestaurantId("restaurant-1");

		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(TableSection);
		expect(result[0]?.sectionName).toBe("Patio");
		expect(mockPrisma.tableSection.findMany).toHaveBeenCalledWith({
			where: { restaurantId: "restaurant-1", isDeleted: false },
			orderBy: { sectionName: "asc" },
		});
	});

	it("filters pagination to active sections for the restaurant", async () => {
		mockPrisma.tableSection.findMany.mockResolvedValue([rawSection]);
		mockPrisma.tableSection.count.mockResolvedValue(1);

		const result = await repository.findManyWithFilter({
			restaurantId: "restaurant-1",
			page: 1,
			limit: 10,
			sortBy: "createdAt",
			sortOrder: "desc",
		});

		expect(result.total).toBe(1);
		expect(result.tableSections[0]?.sectionName).toBe("Patio");
		expect(mockPrisma.tableSection.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { isDeleted: false, restaurantId: "restaurant-1" },
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
			}),
		);
	});
});
