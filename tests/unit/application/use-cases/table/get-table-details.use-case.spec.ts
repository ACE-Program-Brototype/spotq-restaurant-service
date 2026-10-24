import { GetTableDetailsUseCase } from "@/application/use-cases/table/get-table-details.use-case.ts";
import { TABLE_SHAPE, TABLE_STATUS } from "@/domain/constants/table.constants.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { Table } from "@/domain/entities/table.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { TableNotFoundError } from "@/domain/errors/table.errors.ts";
import { StaffInactiveError, StaffNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITableRepository } from "@/domain/repositories/table.repository.interface.ts";

describe("GetTableDetailsUseCase", () => {
	const restaurantId = "restaurant-1";
	const staffId = "staff-1";
	const createdAt = new Date("2026-01-01T00:00:00.000Z");
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let tableRepository: jest.Mocked<ITableRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let useCase: GetTableDetailsUseCase;

	const restaurant = (isAdmin = true) => ({
		id: restaurantId,
		ensureOperationalAccess: jest.fn(),
		isAdmin: jest.fn().mockReturnValue(isAdmin),
		ensureAdminAccess: jest.fn(),
	}) as unknown as Restaurant;
	const table = (overrides: Record<string, unknown> = {}) => ({
		id: "table-1", restaurantId, sectionId: "section-1", tableCode: "A1",
		capacity: 4, tableShape: TABLE_SHAPE.SQUARE, currentOccupancy: 2,
		status: TABLE_STATUS.OCCUPIED, createdAt, ...overrides,
	}) as unknown as Table;
	const input = (overrides: Record<string, unknown> = {}) => ({
		userId: restaurantId, restaurantId, tableId: "table-1", ...overrides,
	});

	beforeEach(() => {
		restaurantRepository = { findById: jest.fn() } as unknown as jest.Mocked<IRestaurantRepository>;
		tableRepository = { findByIdWithSectionName: jest.fn() } as unknown as jest.Mocked<ITableRepository>;
		staffRepository = { findByIdAndRestaurantId: jest.fn() } as unknown as jest.Mocked<IRestaurantStaffRepository>;
		useCase = new GetTableDetailsUseCase(tableRepository, restaurantRepository, staffRepository);
	});

	it("returns table details to the restaurant admin", async () => {
		const owner = restaurant();
		restaurantRepository.findById.mockResolvedValue(owner);
		tableRepository.findByIdWithSectionName.mockResolvedValue({ table: table(), sectionName: "Patio" });

		await expect(useCase.execute(input())).resolves.toEqual({
			tableId: "table-1", restaurantId, sectionId: "section-1", sectionName: "Patio",
			tableCode: "A1", capacity: 4, shape: TABLE_SHAPE.SQUARE,
			currentOccupancy: 2, status: TABLE_STATUS.OCCUPIED, createdAt: createdAt.toISOString(),
		});
		expect(owner.ensureOperationalAccess).toHaveBeenCalled();
		expect(owner.ensureAdminAccess).toHaveBeenCalledWith(restaurantId);
		expect(tableRepository.findByIdWithSectionName).toHaveBeenCalledWith("table-1");
	});

	it("allows active staff and rejects missing or inactive staff", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant(false));
		staffRepository.findByIdAndRestaurantId.mockResolvedValue({ isActive: () => true } as never);
		tableRepository.findByIdWithSectionName.mockResolvedValue({ table: table(), sectionName: "Patio" });
		await expect(useCase.execute(input({ userId: staffId }))).resolves.toMatchObject({ sectionName: "Patio" });

		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(StaffNotFoundError);
		staffRepository.findByIdAndRestaurantId.mockResolvedValue({ isActive: () => false } as never);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(StaffInactiveError);
	});

	it("rejects missing restaurants, missing tables, and tables from another restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(null);
		await expect(useCase.execute(input())).rejects.toThrow(RestaurantNotFoundError);
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findByIdWithSectionName.mockResolvedValue(null);
		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);
		tableRepository.findByIdWithSectionName.mockResolvedValue({ table: table({ restaurantId: "other" }), sectionName: "Patio" });
		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);
	});
});
