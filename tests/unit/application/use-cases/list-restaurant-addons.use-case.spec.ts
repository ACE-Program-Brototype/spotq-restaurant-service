import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListRestaurantAddonsUseCase } from "@/application/use-cases/list-restaurant-addons.use-case.ts";
import { Addon } from "@/domain/entities/addon.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("ListRestaurantAddonsUseCase", () => {
	let restaurantRepository: jest.Mocked<Partial<IRestaurantRepository>>;
	let addonRepository: jest.Mocked<Partial<IAddonRepository>>;
	let useCase: ListRestaurantAddonsUseCase;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		};
		addonRepository = {
			findByRestaurantId: jest.fn(),
		};

		useCase = new ListRestaurantAddonsUseCase(
			restaurantRepository as IRestaurantRepository,
			addonRepository as IAddonRepository,
		);
	});

	it("should list addons for a restaurant", () => {
		(restaurantRepository.findById as jest.Mock).mockResolvedValue({
			id: restaurantId,
		} as unknown as never);

		const addon1 = Addon.create({
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
		});
		const addon2 = Addon.create({
			restaurantId,
			name: "Garlic Dip",
			price: 30.0,
		});

		(addonRepository.findByRestaurantId as jest.Mock).mockResolvedValue([
			addon1,
			addon2,
		] as never);

		return expect(useCase.execute(restaurantId)).resolves.toEqual([
			expect.objectContaining({ name: "Extra Cheese", price: 50.0 }),
			expect.objectContaining({ name: "Garlic Dip", price: 30.0 }),
		]);
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", () => {
		(restaurantRepository.findById as jest.Mock).mockResolvedValue(
			null as never,
		);

		return expect(useCase.execute(restaurantId)).rejects.toThrow(
			RestaurantNotFoundError,
		);
	});
});
