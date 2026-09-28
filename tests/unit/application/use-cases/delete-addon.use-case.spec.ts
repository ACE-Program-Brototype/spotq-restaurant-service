import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { DeleteAddonUseCase } from "@/application/use-cases/delete-addon.use-case.ts";
import { Addon } from "@/domain/entities/addon.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { AddonNotFoundError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";

describe("DeleteAddonUseCase", () => {
	let useCase: DeleteAddonUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockAddonRepo: jest.Mocked<IAddonRepository>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const otherRestaurantId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
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

		useCase = new DeleteAddonUseCase(mockRestaurantRepo, mockAddonRepo);
	});

	it("should soft delete addon successfully", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existingAddon = Addon.create({
			id: addonId,
			restaurantId,
			name: "Extra Cheese",
			price: 50.0,
			isAvailable: true,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(existingAddon);

		mockAddonRepo.updateAddon.mockImplementationOnce(
			async (entity: Addon) => entity,
		);

		await useCase.execute({
			restaurantId,
			addonId,
		});

		expect(mockAddonRepo.findById).toHaveBeenCalledWith(addonId);
		expect(mockAddonRepo.updateAddon).toHaveBeenCalledTimes(1);
		expect(existingAddon.isDeleted).toBe(true);
		expect(existingAddon.isAvailable).toBe(false);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				addonId,
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
			}),
		).rejects.toThrow(AddonNotFoundError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should throw AddonNotFoundError when addon belongs to another restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const otherRestaurantAddon = Addon.create({
			id: addonId,
			restaurantId: otherRestaurantId,
			name: "Extra Bacon",
			price: 80.0,
		});
		mockAddonRepo.findById.mockResolvedValueOnce(otherRestaurantAddon);

		await expect(
			useCase.execute({
				restaurantId,
				addonId,
			}),
		).rejects.toThrow(AddonNotFoundError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});

	it("should throw AddonNotFoundError when addon is already deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const deletedAddon = Addon.reconstitute({
			id: addonId,
			restaurantId,
			name: "Obsolete Addon",
			description: null,
			price: 20.0,
			imageKey: null,
			isAvailable: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockAddonRepo.findById.mockResolvedValueOnce(deletedAddon);

		await expect(
			useCase.execute({
				restaurantId,
				addonId,
			}),
		).rejects.toThrow(AddonNotFoundError);

		expect(mockAddonRepo.updateAddon).not.toHaveBeenCalled();
	});
});
