import { DeleteTableUseCase } from "@application/use-cases/table/delete-table.use-case";
import type { Restaurant } from "@domain/entities/restaurant.entity";
import { Table } from "@domain/entities/table.entity";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import {
	TableInUseError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";

describe("DeleteTableUseCase", () => {
	const restaurantId = "restaurant-1";
	const otherRestaurantId = "restaurant-2";
	const userId = "admin-1";
	const tableId = "table-1";
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let tableRepository: jest.Mocked<ITableRepository>;
	let useCase: DeleteTableUseCase;

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		tableRepository = {
			findById: jest.fn(),
			softDelete: jest.fn(),
		} as unknown as jest.Mocked<ITableRepository>;
		useCase = new DeleteTableUseCase(tableRepository, restaurantRepository);
	});

	const restaurant = () =>
		({
			id: restaurantId,
			ensureAdminAccess: jest.fn(),
		}) as unknown as Restaurant;

	const table = (tableRestaurantId = restaurantId) =>
		Table.create({
			id: tableId,
			restaurantId: tableRestaurantId,
			sectionId: "section-1",
			tableCode: "A1",
			capacity: 4,
			tableShape: "CIRCLE",
		});

	const input = () => ({ restaurantId, userId, tableId });

	it("soft deletes an available table after checking admin access", async () => {
		const existingRestaurant = restaurant();
		const existingTable = table();
		restaurantRepository.findById.mockResolvedValue(existingRestaurant);
		tableRepository.findById.mockResolvedValue(existingTable);

		await expect(useCase.execute(input())).resolves.toBeUndefined();

		expect(existingRestaurant.ensureAdminAccess).toHaveBeenCalledWith(userId);
		expect(tableRepository.softDelete).toHaveBeenCalledWith(tableId);
	});

	it("throws when the restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(input())).rejects.toThrow(
			RestaurantNotFoundError,
		);
		expect(tableRepository.findById).not.toHaveBeenCalled();
		expect(tableRepository.softDelete).not.toHaveBeenCalled();
	});

	it("throws when the table does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);
		expect(tableRepository.softDelete).not.toHaveBeenCalled();
	});

	it("throws when the table belongs to another restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue(table(otherRestaurantId));

		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);
		expect(tableRepository.softDelete).not.toHaveBeenCalled();
	});

	it("throws when the table is in use", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue({
			id: tableId,
			restaurantId,
			isAvailable: () => false,
		} as unknown as Table);

		await expect(useCase.execute(input())).rejects.toThrow(TableInUseError);
		expect(tableRepository.softDelete).not.toHaveBeenCalled();
	});
});
