import { GetTableUseCase } from "@/application/use-cases/table/get-table.use-case.ts";
import {
	TABLE_SHAPE,
	TABLE_STATUS,
} from "@/domain/constants/table.constants.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { Table } from "@/domain/entities/table.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITableRepository } from "@/domain/repositories/table.repository.interface.ts";

describe("GetTableUseCase", () => {
	const restaurantId = "restaurant-1";
	const staffId = "staff-1";
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let tableRepository: jest.Mocked<ITableRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let useCase: GetTableUseCase;

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		tableRepository = {
			findManyWithSection: jest.fn(),
			findAllGroupedBySection: jest.fn(),
		} as unknown as jest.Mocked<ITableRepository>;
		staffRepository = {
			findByStaffIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;
		useCase = new GetTableUseCase(
			restaurantRepository,
			tableRepository,
			staffRepository,
		);
	});

	const restaurant = (overrides: Record<string, unknown> = {}) =>
		({
			id: restaurantId,
			isBlocked: false,
			...overrides,
		}) as unknown as Restaurant;

	const table = (overrides: Record<string, unknown> = {}) =>
		({
			id: "table-1",
			tableCode: "A1",
			capacity: 4,
			status: TABLE_STATUS.AVAILABLE,
			sectionId: "section-1",
			tableShape: TABLE_SHAPE.SQUARE,
			currentOccupancy: 0,
			isActive: true,
			...overrides,
		}) as unknown as Table;

	const input = (overrides: Record<string, unknown> = {}) => ({
		restaurantId,
		userId: restaurantId,
		page: 1,
		limit: 10,
		...overrides,
	});

	it("returns filtered tables for the restaurant owner", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findManyWithSection.mockResolvedValue({
			tables: [{ table: table(), sectionName: "Patio" }],
			total: 1,
		});

		await expect(
			useCase.execute(input({ sectionId: "section-1", minCapacity: 3 })),
		).resolves.toEqual({
			tables: [
				{
					id: "table-1",
					tableCode: "A1",
					capacity: 4,
					status: TABLE_STATUS.AVAILABLE,
					sectionId: "section-1",
					tableShape: TABLE_SHAPE.SQUARE,
					sectionName: "Patio",
				},
			],
			total: 1,
		});
		expect(tableRepository.findManyWithSection).toHaveBeenCalledWith({
			restaurantId,
			page: 1,
			limit: 10,
			sortBy: "tableCode",
			sortOrder: "asc",
			sectionId: "section-1",
			minCapacity: 3,
		});
	});

	it("returns grouped tables for an active staff member", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		staffRepository.findByStaffIdAndRestaurantId.mockResolvedValue({
			isActive: () => true,
		} as never);
		tableRepository.findAllGroupedBySection.mockResolvedValue({
			Patio: [table()],
		});

		await expect(useCase.execute(input({ userId: staffId }))).resolves.toEqual({
			sections: {
				Patio: [
					{
						id: "table-1",
						tableCode: "A1",
						capacity: 4,
						status: TABLE_STATUS.AVAILABLE,
						sectionId: "section-1",
						tableShape: TABLE_SHAPE.SQUARE,
						currentOccupancy: 0,
						isActive: true,
					},
				],
			},
		});
	});

	it("throws when the restaurant is missing or blocked", async () => {
		restaurantRepository.findById.mockResolvedValue(null);
		await expect(useCase.execute(input())).rejects.toThrow(
			RestaurantNotFoundError,
		);

		restaurantRepository.findById.mockResolvedValue(
			restaurant({ isBlocked: true }),
		);
		await expect(useCase.execute(input())).rejects.toThrow(
			RestaurantAccountBlockedError,
		);
		expect(tableRepository.findManyWithSection).not.toHaveBeenCalled();
	});

	it("rejects missing and inactive staff", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		staffRepository.findByStaffIdAndRestaurantId.mockResolvedValue(null);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(
			StaffNotFoundError,
		);

		staffRepository.findByStaffIdAndRestaurantId.mockResolvedValue({
			isActive: () => false,
		} as never);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(
			StaffInactiveError,
		);
		expect(tableRepository.findAllGroupedBySection).not.toHaveBeenCalled();
	});
});
