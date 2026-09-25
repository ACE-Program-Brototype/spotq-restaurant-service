import { MenuCategoryMapper } from "@/application/mappers/menu-category.mapper.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";

describe("MenuCategoryMapper", () => {
	it("should map MenuCategory entity to MenuCategoryResponseDto", () => {
		const entity = MenuCategory.create({
			id: "cat-123",
			restaurantId: "rest-123",
			name: "Main Course",
			description: "Delicious main dishes",
			displayOrder: 1,
			isActive: true,
		});

		const dto = MenuCategoryMapper.toResponseDto(entity);

		expect(dto).toEqual({
			id: entity.id,
			restaurantId: entity.restaurantId,
			name: entity.name,
			description: entity.description,
			displayOrder: entity.displayOrder,
			isActive: entity.isActive,
			createdAt: entity.createdAt.toISOString(),
			updatedAt: entity.updatedAt.toISOString(),
		});
	});
});
