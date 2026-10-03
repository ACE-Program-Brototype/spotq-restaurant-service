import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListStaffMenuItemsUseCase } from "@/application/use-cases/list-staff-menu-items.use-case.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import type { IMenuItemRepository } from "@/domain/repositories/menu-item.repository.interface.ts";

describe("ListStaffMenuItemsUseCase", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let useCase: ListStaffMenuItemsUseCase;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findManyStaffMenuItems: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new ListStaffMenuItemsUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(mockMenuItemRepo.findManyStaffMenuItems).not.toHaveBeenCalled();
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		} as never);

		await expect(
			useCase.execute({
				restaurantId,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);

		expect(mockMenuItemRepo.findManyStaffMenuItems).not.toHaveBeenCalled();
	});

	it("should retrieve items and map response with default pagination and variants embedding", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		const now = new Date("2026-10-02T10:00:00Z");
		mockMenuItemRepo.findManyStaffMenuItems.mockResolvedValueOnce({
			items: [
				{
					id: "item-1",
					name: "Truffle Fries",
					sku: "APP-TRF",
					description: "Crispy fries",
					basePrice: 7.5,
					categoryId,
					categoryName: "Starters",
					categoryDisplayOrder: 1,
					categoryIsActive: true,
					isAvailable: false,
					unavailabilityReason: null,
					autoResetAt: null,
					variantCount: 0,
					hasVariants: false,
					variants: [],
					createdAt: now,
					updatedAt: now,
				},
			],
			total: 1,
		});

		const result = await useCase.execute({
			restaurantId,
			categoryId,
			isAvailable: false,
			includeVariants: true,
		});

		expect(mockMenuItemRepo.findManyStaffMenuItems).toHaveBeenCalledWith({
			restaurantId,
			categoryId,
			isAvailable: false,
			includeInactive: false,
			includeVariants: true,
			search: undefined,
			sortBy: undefined,
			sortOrder: undefined,
			page: 1,
			limit: 50,
		});

		expect(result).toEqual({
			restaurantId,
			page: 1,
			limit: 50,
			totalCount: 1,
			totalPages: 1,
			items: [
				{
					id: "item-1",
					name: "Truffle Fries",
					sku: "APP-TRF",
					description: "Crispy fries",
					basePrice: 7.5,
					categoryId,
					categoryName: "Starters",
					displayOrder: 1,
					isActive: true,
					isAvailable: false,
					unavailabilityReason: null,
					autoResetAt: null,
					variantCount: 0,
					hasVariants: false,
					variants: [],
					updatedAt: now.toISOString(),
				},
			],
		});
	});

	it("should allow includeInactive=true for manager role", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		mockMenuItemRepo.findManyStaffMenuItems.mockResolvedValueOnce({
			items: [],
			total: 0,
		});

		await useCase.execute({
			restaurantId,
			includeInactive: true,
			userRole: "manager",
		});

		expect(mockMenuItemRepo.findManyStaffMenuItems).toHaveBeenCalledWith(
			expect.objectContaining({
				includeInactive: true,
			}),
		);
	});

	it("should ignore includeInactive=true for standard staff role", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		mockMenuItemRepo.findManyStaffMenuItems.mockResolvedValueOnce({
			items: [],
			total: 0,
		});

		await useCase.execute({
			restaurantId,
			includeInactive: true,
			userRole: "server",
		});

		expect(mockMenuItemRepo.findManyStaffMenuItems).toHaveBeenCalledWith(
			expect.objectContaining({
				includeInactive: false,
			}),
		);
	});
});
