import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListMenuItemsUseCase } from "@/application/use-cases/list-menu-items.use-case.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	IMenuItemRepository,
	MenuItemQueryResult,
} from "@/domain/repositories/menu-item.repository.interface.ts";

describe("ListMenuItemsUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let menuItemRepository: jest.Mocked<IMenuItemRepository>;
	let useCase: ListMenuItemsUseCase;

	const mockRestaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	const mockQueryResult: MenuItemQueryResult = {
		items: [
			{
				id: "item-1",
				restaurantId: mockRestaurantId,
				categoryId: "cat-1",
				categoryName: "Starters",
				name: "Bruschetta",
				price: 8.5,
				isVegetarian: true,
				isFeatured: false,
				isAvailable: true,
				image: "menu/bruschetta.jpg",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
		total: 1,
		stats: {
			totalCategories: 3,
			totalMenuItems: 15,
			availableItems: 12,
			outOfStockItems: 3,
		},
	};

	beforeEach(() => {
		restaurantRepository = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		menuItemRepository = {
			findManyWithFiltersAndStats: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		useCase = new ListMenuItemsUseCase(
			restaurantRepository,
			menuItemRepository,
		);
	});

	it("should throw RestaurantNotFoundError if restaurant does not exist", async () => {
		restaurantRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ restaurantId: mockRestaurantId }),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			mockRestaurantId,
		);
		expect(
			menuItemRepository.findManyWithFiltersAndStats,
		).not.toHaveBeenCalled();
	});

	it("should list menu items with filters and return formatted paginated response", async () => {
		restaurantRepository.findById.mockResolvedValue({
			id: mockRestaurantId,
		} as unknown as Awaited<ReturnType<IRestaurantRepository["findById"]>>);
		menuItemRepository.findManyWithFiltersAndStats.mockResolvedValue(
			mockQueryResult,
		);

		const result = await useCase.execute({
			restaurantId: mockRestaurantId,
			page: 1,
			limit: 10,
			search: "bruschetta",
			status: "AVAILABLE",
		});

		expect(restaurantRepository.findById).toHaveBeenCalledWith(
			mockRestaurantId,
		);
		expect(menuItemRepository.findManyWithFiltersAndStats).toHaveBeenCalledWith(
			{
				restaurantId: mockRestaurantId,
				categoryId: undefined,
				search: "bruschetta",
				isAvailable: true,
				isVegetarian: undefined,
				isFeatured: undefined,
				minPrice: undefined,
				maxPrice: undefined,
				sortBy: "createdAt",
				sortOrder: "desc",
				page: 1,
				limit: 10,
			},
		);

		expect(result.stats.totalCategories).toBe(3);
		expect(result.stats.totalMenuItems).toBe(15);
		expect(result.stats.availableItems).toBe(12);
		expect(result.stats.outOfStockItems).toBe(3);
		expect(result.items).toHaveLength(1);
		expect(result.items[0].name).toBe("Bruschetta");
		expect(result.pagination.total).toBe(1);
	});

	it("should map OUT_OF_STOCK status correctly and handle boundary limits", async () => {
		restaurantRepository.findById.mockResolvedValue({
			id: mockRestaurantId,
		} as unknown as Awaited<ReturnType<IRestaurantRepository["findById"]>>);
		menuItemRepository.findManyWithFiltersAndStats.mockResolvedValue(
			mockQueryResult,
		);

		await useCase.execute({
			restaurantId: mockRestaurantId,
			status: "OUT_OF_STOCK",
			limit: 200, // Should be clamped to MAX_LIMIT (100)
			page: 0, // Should fall back to DEFAULT_PAGE (1)
		});

		expect(menuItemRepository.findManyWithFiltersAndStats).toHaveBeenCalledWith(
			expect.objectContaining({
				isAvailable: false,
				limit: 100,
				page: 1,
			}),
		);
	});
});
