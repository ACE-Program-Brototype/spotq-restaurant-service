import { GetTableAvailabilityUseCase } from "@/application/use-cases/table/get-table-availability.use-case.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { ITableRepository } from "@/domain/repositories/table.repository.interface.ts";

describe("GetTableAvailabilityUseCase", () => {
	const restaurantId = "restaurant-1";
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let tableRepository: jest.Mocked<ITableRepository>;
	let useCase: GetTableAvailabilityUseCase;

	beforeEach(() => {
		restaurantRepository = {
			getRestaurantAvailabilitySettings: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		tableRepository = {
			getAvailability: jest.fn(),
		} as unknown as jest.Mocked<ITableRepository>;
		useCase = new GetTableAvailabilityUseCase(
			tableRepository,
			restaurantRepository,
		);
	});

	it("returns settings and counts available tables that cover the party", async () => {
		restaurantRepository.getRestaurantAvailabilitySettings.mockResolvedValue({
			isOpened: true,
			acceptsQueue: true,
		});
		tableRepository.getAvailability.mockResolvedValue({
			restaurantId,
			availableTableCapacities: [2, 4],
		});

		await expect(
			useCase.execute({ restaurantId, partySize: 6 }),
		).resolves.toEqual({
			restaurantId,
			isOpen: true,
			acceptsQueue: true,
			isTableAvailable: true,
			availableCount: 2,
		});
		expect(
			restaurantRepository.getRestaurantAvailabilitySettings,
		).toHaveBeenCalledWith(restaurantId);
		expect(tableRepository.getAvailability).toHaveBeenCalledWith(restaurantId);
	});

	it("returns false when no available table can fit the party", async () => {
		restaurantRepository.getRestaurantAvailabilitySettings.mockResolvedValue({
			isOpened: false,
			acceptsQueue: false,
		});
		tableRepository.getAvailability.mockResolvedValue({
			restaurantId,
			availableTableCapacities: [2, 3],
		});

		await expect(
			useCase.execute({ restaurantId, partySize: 6 }),
		).resolves.toEqual({
			restaurantId,
			isOpen: false,
			acceptsQueue: false,
			isTableAvailable: false,
			availableCount: 2,
		});
	});

	it("returns zero available tables when none are vacant", async () => {
		restaurantRepository.getRestaurantAvailabilitySettings.mockResolvedValue({
			isOpened: true,
			acceptsQueue: false,
		});
		tableRepository.getAvailability.mockResolvedValue({
			restaurantId,
			availableTableCapacities: [],
		});

		await expect(
			useCase.execute({ restaurantId, partySize: 2 }),
		).resolves.toEqual({
			restaurantId,
			isOpen: true,
			acceptsQueue: false,
			isTableAvailable: false,
			availableCount: 0,
		});
	});

	it("throws when restaurant settings are missing", async () => {
		restaurantRepository.getRestaurantAvailabilitySettings.mockResolvedValue(
			null,
		);

		await expect(
			useCase.execute({ restaurantId, partySize: 2 }),
		).rejects.toThrow("Restaurant not found");
		expect(tableRepository.getAvailability).not.toHaveBeenCalled();
	});
});
