import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { CreateAddonUseCase } from "@/application/use-cases/create-addon.use-case.ts";
import { Addon } from "@/domain/entities/addon.entity.ts";
import { AddonAlreadyExistsError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

describe("CreateAddonUseCase", () => {
	let restaurantRepository: jest.Mocked<Partial<IRestaurantRepository>>;
	let addonRepository: jest.Mocked<Partial<IAddonRepository>>;
	let useCase: CreateAddonUseCase;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		};
		addonRepository = {
			findByNameAndRestaurantId: jest.fn(),
			create: jest.fn(),
		};

		useCase = new CreateAddonUseCase(
			restaurantRepository as IRestaurantRepository,
			addonRepository as IAddonRepository,
		);
	});

	it("should create an addon successfully", () => {
		(restaurantRepository.findById as jest.Mock).mockResolvedValue({
			id: restaurantId,
		} as unknown as never);
		(addonRepository.findByNameAndRestaurantId as jest.Mock).mockResolvedValue(
			null as never,
		);

		const fakeCreated = Addon.create({
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
			description: "Yummy cheese",
			imageKey: "addons/cheese.png",
		});
		(addonRepository.create as jest.Mock).mockResolvedValue(
			fakeCreated as never,
		);

		return expect(
			useCase.execute({
				restaurantId,
				name: "Extra Cheese",
				price: 50.0,
				description: "Yummy cheese",
				imageKey: "addons/cheese.png",
			}),
		).resolves.toMatchObject({
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
			description: "Yummy cheese",
			imageKey: "addons/cheese.png",
			isAvailable: true,
		});
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", () => {
		(restaurantRepository.findById as jest.Mock).mockResolvedValue(
			null as never,
		);

		return expect(
			useCase.execute({
				restaurantId,
				name: "Extra Cheese",
				price: 50.0,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw AddonAlreadyExistsError if addon name already exists in restaurant", () => {
		(restaurantRepository.findById as jest.Mock).mockResolvedValue({
			id: restaurantId,
		} as unknown as never);
		const existing = Addon.create({
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
		});
		(addonRepository.findByNameAndRestaurantId as jest.Mock).mockResolvedValue(
			existing as never,
		);

		return expect(
			useCase.execute({
				restaurantId,
				name: "Extra Cheese",
				price: 50.0,
			}),
		).rejects.toThrow(AddonAlreadyExistsError);
	});
});
