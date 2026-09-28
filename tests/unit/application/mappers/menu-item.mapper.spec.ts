import { describe, expect, it } from "@jest/globals";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type {
	MenuItemWithRelations,
	RestaurantMenuStats,
} from "@/domain/repositories/menu-item.repository.interface.ts";

describe("MenuItemMapper", () => {
	const mockRawItem: MenuItemWithRelations = {
		id: "item-1",
		restaurantId: "rest-1",
		categoryId: "cat-1",
		categoryName: "Main Course",
		name: "Wagyu Burger",
		price: 22.5,
		isVegetarian: false,
		isFeatured: true,
		isAvailable: true,
		image: "menu/burger.jpg",
		createdAt: new Date("2026-09-28T10:00:00.000Z"),
		updatedAt: new Date("2026-09-28T10:00:00.000Z"),
	};

	const mockStats: RestaurantMenuStats = {
		totalCategories: 4,
		totalMenuItems: 10,
		availableItems: 8,
		outOfStockItems: 2,
	};

	it("should map MenuItemWithRelations to MenuItemListItemDto", () => {
		const dto = MenuItemMapper.toListItemDto(mockRawItem);

		expect(dto.id).toBe("item-1");
		expect(dto.categoryName).toBe("Main Course");
		expect(dto.image).toBe("menu/burger.jpg");
		expect(dto.createdAt).toBe("2026-09-28T10:00:00.000Z");
	});

	it("should map stats correctly", () => {
		const statsDto = MenuItemMapper.toStatsDto(mockStats);

		expect(statsDto.totalCategories).toBe(4);
		expect(statsDto.totalMenuItems).toBe(10);
		expect(statsDto.availableItems).toBe(8);
		expect(statsDto.outOfStockItems).toBe(2);
	});

	it("should construct paginated response with pagination metadata", () => {
		const response = MenuItemMapper.toPaginatedResponse(
			[mockRawItem],
			25,
			mockStats,
			2,
			10,
		);

		expect(response.stats.totalMenuItems).toBe(10);
		expect(response.items).toHaveLength(1);
		expect(response.pagination.page).toBe(2);
		expect(response.pagination.limit).toBe(10);
		expect(response.pagination.total).toBe(25);
		expect(response.pagination.totalPages).toBe(3);
		expect(response.pagination.hasNextPage).toBe(true);
		expect(response.pagination.hasPrevPage).toBe(true);
	});
});
