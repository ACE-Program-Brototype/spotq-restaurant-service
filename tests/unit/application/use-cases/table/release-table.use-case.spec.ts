import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ReleaseTableUseCase } from "@/application/use-cases/table/release-table.use-case.ts";
import { TABLE_STATUS } from "@/domain/constants/table.constants.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { Table } from "@/domain/entities/table.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import {
	InvalidTableOccupancyError,
	TableNotAvailableError,
	TableNotFoundError,
} from "@/domain/errors/table.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITableRepository } from "@/domain/repositories/table.repository.interface.ts";

describe("ReleaseTableUseCase", () => {
	const restaurantId = "2b6f0cc9-8d13-4f2e-a123-9e8ab12cd345";
	const staffId = "7c1a9d44-22f4-4ab8-91ef-123456789abc";
	const tableId1 = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
	const tableId2 = "3fa85f64-5717-4562-b3fc-2c963f66afa7";

	let tableRepository: jest.Mocked<ITableRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let useCase: ReleaseTableUseCase;

	const mockRestaurant = (isAdmin = true) =>
		({
			id: restaurantId,
			isAdmin: jest.fn(() => isAdmin),
			ensureAdminAccess: jest.fn(),
			ensureOperationalAccess: jest.fn(),
		}) as unknown as Restaurant;

	const mockTable = (overrides: Record<string, unknown> = {}) => {
		const entity = {
			id: tableId1,
			tableCode: "T-01",
			restaurantId,
			capacity: 4,
			currentOccupancy: 4,
			status: TABLE_STATUS.OCCUPIED,
			releaseGuest: jest.fn(function (
				this: { currentOccupancy: number; status: string; capacity: number },
				count: number,
			) {
				if (
					this.status !== TABLE_STATUS.PARTIAL_OCCUPIED &&
					this.status !== TABLE_STATUS.OCCUPIED
				) {
					throw new TableNotAvailableError();
				}
				if (count > this.currentOccupancy) {
					throw new InvalidTableOccupancyError();
				}
				this.currentOccupancy -= count;
				this.status =
					this.currentOccupancy === 0
						? TABLE_STATUS.AVAILABLE
						: TABLE_STATUS.PARTIAL_OCCUPIED;
			}),
			...overrides,
		};
		return entity as unknown as Table;
	};

	beforeEach(() => {
		tableRepository = {
			findByIds: jest.fn(),
			updateMany: jest.fn(),
		} as unknown as jest.Mocked<ITableRepository>;
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		staffRepository = {
			findByIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;

		useCase = new ReleaseTableUseCase(
			tableRepository,
			restaurantRepository,
			staffRepository,
		);
	});

	it("successfully releases multiple tables in a single batch request", async () => {
		const t1 = mockTable({
			id: tableId1,
			currentOccupancy: 2,
			status: TABLE_STATUS.PARTIAL_OCCUPIED,
		});
		const t2 = mockTable({
			id: tableId2,
			tableCode: "T-02",
			currentOccupancy: 4,
			status: TABLE_STATUS.OCCUPIED,
		});
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(true));
		tableRepository.findByIds.mockResolvedValue([t1, t2]);

		const result = await useCase.execute({
			restaurantId,
			userId: restaurantId,
			tables: [
				{ tableId: tableId1, occupancyToRelease: 2 },
				{ tableId: tableId2, occupancyToRelease: 1 },
			],
		});

		expect(result.releasedTables).toHaveLength(2);
		expect(result.releasedTables[0]?.status).toBe(TABLE_STATUS.AVAILABLE);
		expect(result.releasedTables[1]?.status).toBe(
			TABLE_STATUS.PARTIAL_OCCUPIED,
		);
		expect(tableRepository.updateMany).toHaveBeenCalledWith([t1, t2]);
	});

	it("successfully releases guests and sets status to PARTIAL_OCCUPIED when occupancy remains > 0", async () => {
		const t1 = mockTable({
			id: tableId1,
			currentOccupancy: 4,
			status: TABLE_STATUS.OCCUPIED,
		});
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(true));
		tableRepository.findByIds.mockResolvedValue([t1]);

		const result = await useCase.execute({
			restaurantId,
			userId: restaurantId,
			tables: [{ tableId: tableId1, occupancyToRelease: 2 }],
		});

		expect(result.releasedTables[0]?.status).toBe(
			TABLE_STATUS.PARTIAL_OCCUPIED,
		);
		expect(result.releasedTables[0]?.currentOccupancy).toBe(2);
		expect(tableRepository.updateMany).toHaveBeenCalledWith([t1]);
	});

	it("allows active staff members to release tables", async () => {
		const t1 = mockTable({
			id: tableId1,
			currentOccupancy: 3,
			status: TABLE_STATUS.PARTIAL_OCCUPIED,
		});
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(false));
		staffRepository.findByIdAndRestaurantId.mockResolvedValue({
			isActive: () => true,
		} as never);
		tableRepository.findByIds.mockResolvedValue([t1]);

		const result = await useCase.execute({
			restaurantId,
			userId: staffId,
			tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
		});

		expect(result.releasedTables[0]?.currentOccupancy).toBe(2);
		expect(staffRepository.findByIdAndRestaurantId).toHaveBeenCalledWith(
			staffId,
			restaurantId,
		);
		expect(tableRepository.updateMany).toHaveBeenCalledWith([t1]);
	});

	it("rejects when release count exceeds current occupancy (prevents negative occupancy)", async () => {
		const t1 = mockTable({
			id: tableId1,
			currentOccupancy: 2,
			status: TABLE_STATUS.PARTIAL_OCCUPIED,
		});
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(true));
		tableRepository.findByIds.mockResolvedValue([t1]);

		await expect(
			useCase.execute({
				restaurantId,
				userId: restaurantId,
				tables: [{ tableId: tableId1, occupancyToRelease: 3 }],
			}),
		).rejects.toThrow(InvalidTableOccupancyError);

		expect(tableRepository.updateMany).not.toHaveBeenCalled();
	});

	it("rejects when table is already in AVAILABLE status", async () => {
		const t1 = mockTable({
			id: tableId1,
			currentOccupancy: 0,
			status: TABLE_STATUS.AVAILABLE,
		});
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(true));
		tableRepository.findByIds.mockResolvedValue([t1]);

		await expect(
			useCase.execute({
				restaurantId,
				userId: restaurantId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(TableNotAvailableError);

		expect(tableRepository.updateMany).not.toHaveBeenCalled();
	});

	it("rejects when restaurant is not found", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId,
				userId: restaurantId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(tableRepository.findByIds).not.toHaveBeenCalled();
	});

	it("rejects when staff member is not found or inactive", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(false));
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);

		await expect(
			useCase.execute({
				restaurantId,
				userId: staffId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(StaffNotFoundError);

		staffRepository.findByIdAndRestaurantId.mockResolvedValue({
			isActive: () => false,
		} as never);

		await expect(
			useCase.execute({
				restaurantId,
				userId: staffId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(StaffInactiveError);
	});

	it("rejects when any requested table is missing or belongs to another restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(mockRestaurant(true));
		tableRepository.findByIds.mockResolvedValue([
			mockTable({ id: tableId1, restaurantId: "different-restaurant" }),
		]);

		await expect(
			useCase.execute({
				restaurantId,
				userId: restaurantId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(TableNotFoundError);

		tableRepository.findByIds.mockResolvedValue([]);
		await expect(
			useCase.execute({
				restaurantId,
				userId: restaurantId,
				tables: [{ tableId: tableId1, occupancyToRelease: 1 }],
			}),
		).rejects.toThrow(TableNotFoundError);
	});
});
