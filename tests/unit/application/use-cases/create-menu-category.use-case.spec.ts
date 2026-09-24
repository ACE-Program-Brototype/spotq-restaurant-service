import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { CategoryAlreadyExistsError } from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";

describe("CreateMenuCategoryUseCase", () => {
	let useCase: CreateMenuCategoryUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepository>;

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
			getNextDisplayOrder: jest.fn(),
			create: jest.fn(),
			updateCategory: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		useCase = new CreateMenuCategoryUseCase(
			mockRestaurantRepo,
			mockMenuCategoryRepo,
		);
	});

	it("should create category successfully with auto-calculated displayOrder when omitted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(null);
		mockMenuCategoryRepo.getNextDisplayOrder.mockResolvedValueOnce(3);

		mockMenuCategoryRepo.create.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			name: "Beverages",
			description: "Hot and cold drinks",
		});

		expect(result).toBeDefined();
		expect(result.restaurantId).toBe(restaurantId);
		expect(result.name).toBe("Beverages");
		expect(result.description).toBe("Hot and cold drinks");
		expect(result.displayOrder).toBe(3);
		expect(result.isActive).toBe(true);
		expect(mockMenuCategoryRepo.getNextDisplayOrder).toHaveBeenCalledWith(
			restaurantId,
		);
		expect(mockMenuCategoryRepo.create).toHaveBeenCalledTimes(1);
	});

	it("should create category successfully respecting provided displayOrder", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(null);

		mockMenuCategoryRepo.create.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const result = await useCase.execute({
			restaurantId,
			name: "Starters",
			displayOrder: 1,
		});

		expect(result.displayOrder).toBe(1);
		expect(mockMenuCategoryRepo.getNextDisplayOrder).not.toHaveBeenCalled();
	});

	it("should throw RestaurantNotFoundError when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				restaurantId: "non-existent-restaurant",
				name: "Desserts",
			}),
		).rejects.toThrow(RestaurantNotFoundError);

		expect(
			mockMenuCategoryRepo.findByNameAndRestaurantId,
		).not.toHaveBeenCalled();
		expect(mockMenuCategoryRepo.create).not.toHaveBeenCalled();
	});

	it("should throw CategoryAlreadyExistsError when category name already exists for the restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const existing = MenuCategory.create({
			restaurantId,
			name: "Starters",
		});
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(
			existing,
		);

		await expect(
			useCase.execute({
				restaurantId,
				name: "Starters",
			}),
		).rejects.toThrow(CategoryAlreadyExistsError);

		expect(mockMenuCategoryRepo.create).not.toHaveBeenCalled();
	});
});
