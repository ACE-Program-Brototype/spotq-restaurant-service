import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListRestaurantMenuCategoriesUseCase } from "@/application/use-cases/list-restaurant-menu-categories.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("ListRestaurantMenuCategoriesUseCase", () => {
	let useCase: ListRestaurantMenuCategoriesUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepositoryPort>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

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

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			findByRestaurantId: jest.fn(),
			getNextDisplayOrder: jest.fn(),
			create: jest.fn(),
		};

		useCase = new ListRestaurantMenuCategoriesUseCase(
			mockRestaurantRepo,
			mockMenuCategoryRepo,
		);
	});

	it("should throw RestaurantNotFoundError when the restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(useCase.execute({ restaurantId })).rejects.toThrow(
			RestaurantNotFoundError,
		);
		await expect(useCase.execute({ restaurantId })).rejects.toThrow(
			messages.RESTAURANT_NOT_FOUND,
		);
		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith(restaurantId);
		expect(mockMenuCategoryRepo.findByRestaurantId).not.toHaveBeenCalled();
	});

	it("should return populated categories ordered by displayOrder when restaurant exists", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const cat1 = MenuCategory.reconstitute({
			id: "cat-1",
			restaurantId,
			name: "Beverages",
			description: "Cold & hot drinks",
			displayOrder: 0,
			isActive: true,
			createdAt: new Date("2026-09-24T10:00:00Z"),
			updatedAt: new Date("2026-09-24T10:00:00Z"),
		});

		const cat2 = MenuCategory.reconstitute({
			id: "cat-2",
			restaurantId,
			name: "Main Course",
			description: null,
			displayOrder: 1,
			isActive: false,
			createdAt: new Date("2026-09-24T11:00:00Z"),
			updatedAt: new Date("2026-09-24T11:00:00Z"),
		});

		mockMenuCategoryRepo.findByRestaurantId.mockResolvedValueOnce([cat1, cat2]);

		const result = await useCase.execute({ restaurantId });

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith(restaurantId);
		expect(mockMenuCategoryRepo.findByRestaurantId).toHaveBeenCalledWith(
			restaurantId,
		);
		expect(result).toEqual({
			restaurantId,
			categories: [
				{
					id: "cat-1",
					name: "Beverages",
					description: "Cold & hot drinks",
					isActive: true,
					displayOrder: 0,
				},
				{
					id: "cat-2",
					name: "Main Course",
					description: null,
					isActive: false,
					displayOrder: 1,
				},
			],
		});
	});

	it("should return an empty categories array when the restaurant has zero configured categories", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuCategoryRepo.findByRestaurantId.mockResolvedValueOnce([]);

		const result = await useCase.execute({ restaurantId });

		expect(mockRestaurantRepo.findById).toHaveBeenCalledWith(restaurantId);
		expect(mockMenuCategoryRepo.findByRestaurantId).toHaveBeenCalledWith(
			restaurantId,
		);
		expect(result).toEqual({
			restaurantId,
			categories: [],
		});
	});
});
