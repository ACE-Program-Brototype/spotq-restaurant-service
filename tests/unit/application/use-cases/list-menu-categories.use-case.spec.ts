import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import { ListMenuCategoriesUseCase } from "@/application/use-cases/list-menu-categories.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";

describe("ListMenuCategoriesUseCase", () => {
	let useCase: ListMenuCategoriesUseCase;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepositoryPort>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		jest.clearAllMocks();

		mockMenuCategoryRepo = {
			findByRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepositoryPort>;

		useCase = new ListMenuCategoriesUseCase(mockMenuCategoryRepo);
	});

	it("should return categories for restaurant", async () => {
		const category = MenuCategory.create({
			restaurantId,
			name: "Main Course",
			description: "Main dishes",
			displayOrder: 1,
			isActive: true,
		});

		mockMenuCategoryRepo.findByRestaurantId.mockResolvedValueOnce([category]);

		const result = await useCase.execute(restaurantId);

		expect(mockMenuCategoryRepo.findByRestaurantId).toHaveBeenCalledWith(
			restaurantId,
		);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Main Course");
	});
});
