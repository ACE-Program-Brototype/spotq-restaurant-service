import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateAddonUseCase } from "@/application/use-cases/update-addon.use-case.ts";
import { Addon } from "@/domain/entities/addon.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import {
	AddonAlreadyExistsError,
	AddonNotFoundError,
} from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";

describe("UpdateAddonUseCase", () => {
	let useCase: UpdateAddonUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockAddonRepo: jest.Mocked<IAddonRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const addonId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
			exists: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			update: jest.fn(),
			findByEmail: jest.fn(),
			existsByEmail: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockAddonRepo = {
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			findByRestaurantId: jest.fn(),
			create: jest.fn(),
			updateAddon: jest.fn(),
		} as unknown as jest.Mocked<IAddonRepository>;

		useCase = new UpdateAddonUseCase(mockRestaurantRepo, mockAddonRepo);
	});

	it("should update addon successfully with partial payload", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingAddon = Addon.create({
			id: addonId,
			restaurantId,
			name: "Extra Cheese",
			description: "Old description",
			price: 50.0,
			imageKey: "addons/cheese.png",
			isAvailable: true,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(existingAddon);

		mockAddonRepo.updateAddon.mockImplementationOnce(
			async (entity: Addon) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			addonId,
			price: 70.0,
			description: "Updated description",
			isAvailable: false,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(addonId);
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Extra Cheese");
		expect(result.description).toBe("Updated description");
		expect(result.price).toBe(70.0);
		expect(result.isAvailable).toBe(false);
		expect(mockAddonRepo.updateAddon).toHaveBeenCalledTimes(1);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				addonId,
				name: "New Name",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockAddonRepo.findById).not.toHaveBeenCalled();
		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should throw AddonNotFoundError when addon does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockAddonRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
				addonId: "non-existent-addon",
				name: "New Name",
			}),
		).rejects.toThrow(AddonNotFoundError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should throw AddonNotFoundError when addon belongs to another restaurant (data isolation)", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const otherRestaurantAddon = Addon.create({
			id: addonId,
			restaurantId: "other-restaurant-id",
			name: "Bacon",
			price: 40.0,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(otherRestaurantAddon);

		await expect(
			useCase.execute({
				restaurantId,
				addonId,
				name: "New Name",
			}),
		).rejects.toThrow(AddonNotFoundError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should throw AddonAlreadyExistsError when new name conflicts with another addon in the same restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingAddon = Addon.create({
			id: addonId,
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(existingAddon);

		const conflictingAddon = Addon.create({
			id: "different-addon-id",
			restaurantId,
			name: "Bacon Strips",
			price: 60.0,
		});
		mockAddonRepo.findByNameAndRestaurantId.mockResolvedValueOnce(
			conflictingAddon,
		);

		await expect(
			useCase.execute({
				restaurantId,
				addonId,
				name: "Bacon Strips",
			}),
		).rejects.toThrow(AddonAlreadyExistsError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should allow updating name if it matches the current addon's name", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingAddon = Addon.create({
			id: addonId,
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(existingAddon);

		mockAddonRepo.updateAddon.mockImplementationOnce(
			async (entity: Addon) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			addonId,
			name: "Extra Cheese",
		});

		expect(result.name).toBe("Extra Cheese");
		expect(mockAddonRepo.updateAddon).toHaveBeenCalledTimes(1);
	});
});
