import { UpdateTableUseCase } from "@application/use-cases/table/update-table.use-case";
import type { Restaurant } from "@domain/entities/restaurant.entity";
import { Table } from "@domain/entities/table.entity";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import {
	TableAlreadyExistsError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import { TableSectionNotFound } from "@domain/errors/table-section.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type MockRestaurantRepository = jest.Mocked<
	Pick<IRestaurantRepository, "findById">
>;

type MockTableRepository = jest.Mocked<
	Pick<ITableRepository, "findById" | "findByTableCodeAndRestaurant" | "save">
>;

type MockTableSectionRepository = jest.Mocked<
	Pick<ITableSectionRepository, "findById">
>;

describe("UpdateTableUseCase", () => {
	let useCase: UpdateTableUseCase;
	let restaurantRepo: MockRestaurantRepository;
	let tableRepo: MockTableRepository;
	let tableSectionRepo: MockTableSectionRepository;

	const restaurantId = "restaurant-1";
	const otherRestaurantId = "restaurant-2";
	const userId = "admin-1";
	const tableId = "table-1";
	const sectionId = "section-1";

	const makeTable = (tableRestaurantId = restaurantId) =>
		Table.create({
			id: tableId,
			restaurantId: tableRestaurantId,
			sectionId,
			tableCode: "A1",
			capacity: 4,
			tableShape: "CIRCLE",
		});

	beforeEach(() => {
		restaurantRepo = {
			findById: jest.fn<IRestaurantRepository["findById"]>(),
		};

		tableRepo = {
			findById: jest.fn<ITableRepository["findById"]>(),
			findByTableCodeAndRestaurant:
				jest.fn<ITableRepository["findByTableCodeAndRestaurant"]>(),
			save: jest.fn<ITableRepository["save"]>(),
		};

		tableSectionRepo = {
			findById: jest.fn<ITableSectionRepository["findById"]>(),
		};

		useCase = new UpdateTableUseCase(
			tableRepo as unknown as ITableRepository,
			restaurantRepo as unknown as IRestaurantRepository,
			tableSectionRepo as unknown as ITableSectionRepository,
		);
	});

	const mockRestaurant = () => {
		restaurantRepo.findById.mockResolvedValue({
			id: restaurantId,
			ensureAdminAccess: jest.fn(),
		} as unknown as Restaurant);
	};

	it("updates provided fields and saves the table", async () => {
		mockRestaurant();

		const table = makeTable();
		tableRepo.findById.mockResolvedValue(table);
		tableRepo.save.mockResolvedValue(undefined);
		tableSectionRepo.findById.mockResolvedValue({
			id: "section-2",
			restaurantId,
		} as Awaited<ReturnType<ITableSectionRepository["findById"]>>);

		const result = await useCase.execute({
			tableId,
			restaurantId,
			userId,
			tableCode: "  B2  ",
			sectionId: "section-2",
			capacity: 6,
			type: "SQUARE",
		});

		expect(result).toBe(table);
		expect(table.tableCode).toBe("B2");
		expect(table.sectionId).toBe("section-2");
		expect(table.capacity).toBe(6);
		expect(table.tableShape).toBe("SQUARE");
		expect(tableRepo.save).toHaveBeenCalledWith(table);
	});

	it("throws when the restaurant does not exist", async () => {
		restaurantRepo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ tableId, restaurantId, userId }),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(tableRepo.findById).not.toHaveBeenCalled();
	});

	it("throws when the table does not exist", async () => {
		mockRestaurant();
		tableRepo.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ tableId, restaurantId, userId }),
		).rejects.toThrow(TableNotFoundError);

		expect(tableRepo.save).not.toHaveBeenCalled();
	});

	it("throws when the table belongs to another restaurant", async () => {
		mockRestaurant();
		tableRepo.findById.mockResolvedValue(makeTable(otherRestaurantId));

		await expect(
			useCase.execute({ tableId, restaurantId, userId }),
		).rejects.toThrow(TableNotFoundError);

		expect(tableRepo.save).not.toHaveBeenCalled();
	});

	it("throws when the requested section belongs to another restaurant", async () => {
		mockRestaurant();
		tableRepo.findById.mockResolvedValue(makeTable());

		tableSectionRepo.findById.mockResolvedValue({
			id: "section-2",
			restaurantId: otherRestaurantId,
		} as Awaited<ReturnType<ITableSectionRepository["findById"]>>);

		await expect(
			useCase.execute({
				tableId,
				restaurantId,
				userId,
				sectionId: "section-2",
			}),
		).rejects.toThrow(TableSectionNotFound);

		expect(tableRepo.save).not.toHaveBeenCalled();
	});

	it("throws when the new table code is already used by another table", async () => {
		mockRestaurant();
		tableRepo.findById.mockResolvedValue(makeTable());

		tableRepo.findByTableCodeAndRestaurant.mockResolvedValue({
			id: "table-2",
		} as Awaited<ReturnType<ITableRepository["findByTableCodeAndRestaurant"]>>);

		await expect(
			useCase.execute({
				tableId,
				restaurantId,
				userId,
				tableCode: "B2",
			}),
		).rejects.toThrow(TableAlreadyExistsError);

		expect(tableRepo.save).not.toHaveBeenCalled();
	});
});
