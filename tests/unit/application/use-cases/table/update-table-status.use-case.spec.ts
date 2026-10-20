import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UpdateTableStatusUseCase } from "@/application/use-cases/table/update-table-status.use-case.ts";
import { TABLE_STATUS } from "@/domain/constants/table.constants.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { Table } from "@/domain/entities/table.entity.ts";
import {
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import { TableNotFoundError } from "@/domain/errors/table.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITableRepository } from "@/domain/repositories/table.repository.interface.ts";

describe("UpdateTableStatusUseCase", () => {
	const restaurantId = "restaurant-1";
	const staffId = "staff-1";
	const tableId = "table-1";
	let tableRepository: jest.Mocked<ITableRepository>;
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let useCase: UpdateTableStatusUseCase;

	const input = (overrides: Record<string, unknown> = {}) => ({
		restaurantId,
		userId: restaurantId,
		tableId,
		status: TABLE_STATUS.MAINTENANCE,
		...overrides,
	});

	const restaurant = (isAdmin = true) =>
		({
			id: restaurantId,
			isAdmin: jest.fn(() => isAdmin),
			ensureAdminAccess: jest.fn(),
			ensureOperationalAccess: jest.fn()
		}) as unknown as Restaurant;

	const table = (overrides: Record<string, unknown> = {}) => {
		const entity = {
			id: tableId,
			restaurantId,
			status: TABLE_STATUS.AVAILABLE,
			updatedAt: new Date("2026-10-17T10:00:00.000Z"),
			transitionTo: jest.fn(function (this: { status: string }, status: string) {
				this.status = status;
			}),
			...overrides,
		};
		return entity as unknown as Table;
	};

	beforeEach(() => {
		tableRepository = {
			findById: jest.fn(),
			save: jest.fn(),
		} as unknown as jest.Mocked<ITableRepository>;
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		staffRepository = {
			findByIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;
		useCase = new UpdateTableStatusUseCase(
			tableRepository,
			restaurantRepository,
			staffRepository,
		);
	});

	it("updates and saves table status for the restaurant owner", async () => {
		const entity = table();
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue(entity);

		await expect(useCase.execute(input())).resolves.toEqual({
			tableId,
			status: TABLE_STATUS.MAINTENANCE,
			updatedAt: "2026-10-17T10:00:00.000Z",
		});
		expect(entity.transitionTo).toHaveBeenCalledWith(TABLE_STATUS.MAINTENANCE);
		expect(tableRepository.save).toHaveBeenCalledWith(entity);
		expect(staffRepository.findByIdAndRestaurantId).not.toHaveBeenCalled();
	});

	it("allows an active staff member to update table status", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant(false));
		staffRepository.findByIdAndRestaurantId.mockResolvedValue({
			isActive: () => true,
		} as never);
		tableRepository.findById.mockResolvedValue(table());

		await expect(useCase.execute(input({ userId: staffId }))).resolves.toMatchObject({
			tableId,
			status: TABLE_STATUS.MAINTENANCE,
		});
		expect(staffRepository.findByIdAndRestaurantId).toHaveBeenCalledWith(
			staffId,
			restaurantId,
		);
		expect(tableRepository.save).toHaveBeenCalledTimes(1);
	});

	it("rejects a missing restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(input())).rejects.toThrow(RestaurantNotFoundError);
		expect(staffRepository.findByIdAndRestaurantId).not.toHaveBeenCalled();
		expect(tableRepository.findById).not.toHaveBeenCalled();
	});

	it("rejects missing or inactive staff", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant(false));
		staffRepository.findByIdAndRestaurantId.mockResolvedValue(null);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(
			StaffNotFoundError,
		);

		staffRepository.findByIdAndRestaurantId.mockResolvedValue({
			isActive: () => false,
		} as never);
		await expect(useCase.execute(input({ userId: staffId }))).rejects.toThrow(
			StaffInactiveError,
		);
		expect(tableRepository.findById).not.toHaveBeenCalled();
	});

	it("rejects a missing table or a table from another restaurant", async () => {
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue(null);
		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);

		tableRepository.findById.mockResolvedValue(
			table({ restaurantId: "another-restaurant" }),
		);
		await expect(useCase.execute(input())).rejects.toThrow(TableNotFoundError);
		expect(tableRepository.save).not.toHaveBeenCalled();
	});

	it("does not save when the table rejects the requested transition", async () => {
		const entity = table({
			transitionTo: jest.fn(() => {
				throw new Error("Invalid transition");
			}),
		});
		restaurantRepository.findById.mockResolvedValue(restaurant());
		tableRepository.findById.mockResolvedValue(entity);

		await expect(useCase.execute(input())).rejects.toThrow("Invalid transition");
		expect(tableRepository.save).not.toHaveBeenCalled();
	});
});
