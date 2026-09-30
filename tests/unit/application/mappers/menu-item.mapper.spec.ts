import { describe, expect, it } from "@jest/globals";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type {
	MenuItemAggregate,
	MenuItemWithRelations,
	RestaurantMenuStats,
} from "@/domain/repositories/menu-item.repository.interface.ts";

describe("MenuItemMapper", () => {
	it("should map MenuItemAggregate to MenuItemResponseDto", () => {
		const now = new Date();
		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-123",
			name: "Chicken Biryani",
			description: "Classic dum biryani",
			price: 320.0,
			preparationTime: 25,
			calories: 600,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		const variant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId: "item-123",
			sku: "BIRYANI-FULL",
			name: "Full Portion",
			price: 320.0,
			isDefault: true,
			createdAt: now,
			updatedAt: now,
		});

		const aggregate: MenuItemAggregate = {
			item,
			images: [
				{
					id: "img-1",
					menuItemId: "item-123",
					objectKey: "menu/biryani.png",
					displayOrder: 0,
					createdAt: now,
				},
			],
			variants: [variant],
			addons: [
				{
					id: "junc-1",
					menuItemId: "item-123",
					addonId: "addon-1",
					name: "Extra Raita",
					price: 30.0,
					priceOverride: 40.0,
				},
			],
		};

		const dto = MenuItemMapper.toResponseDto(aggregate);

		expect(dto).toEqual({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-123",
			name: "Chicken Biryani",
			description: "Classic dum biryani",
			price: 320.0,
			preparationTime: 25,
			calories: 600,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			images: [
				{
					id: "img-1",
					objectKey: "menu/biryani.png",
					displayOrder: 0,
				},
			],
			variants: [
				{
					id: "var-1",
					sku: "BIRYANI-FULL",
					name: "Full Portion",
					price: 320.0,
					isDefault: true,
				},
			],
			addons: [
				{
					id: "junc-1",
					addonId: "addon-1",
					name: "Extra Raita",
					price: 30.0,
					priceOverride: 40.0,
				},
			],
			createdAt: now.toISOString(),
			updatedAt: now.toISOString(),
		});
	});

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
		expect(response.pagination.totalPages).toBe(3);
		expect(response.pagination.hasNextPage).toBe(true);
		expect(response.pagination.hasPrevPage).toBe(true);
	});

	it("should map MenuItemDetailsAggregate to MenuItemDetailsResponseDto with object keys", () => {
		const now = new Date();
		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-123",
			name: "Chicken Biryani",
			description: "Classic dum biryani",
			price: 320.0,
			preparationTime: 25,
			calories: 600,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		const variant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId: "item-123",
			sku: "BIRYANI-FULL",
			name: "Full Portion",
			price: 320.0,
			isDefault: true,
			createdAt: now,
			updatedAt: now,
		});

		const detailsAggregate = {
			item,
			category: {
				id: "cat-123",
				name: "Biryani",
				description: "Delicious rice dishes",
				isActive: true,
			},
			images: [
				{
					id: "img-1",
					menuItemId: "item-123",
					objectKey: "menu/biryani.png",
					displayOrder: 0,
					createdAt: now,
				},
			],
			variants: [variant],
			addons: [
				{
					id: "junc-1",
					menuItemId: "item-123",
					addonId: "addon-1",
					name: "Extra Raita",
					description: "Cool cucumber yogurt",
					price: 30.0,
					priceOverride: 40.0,
					imageKey: "addons/raita.png",
					isAvailable: true,
					isDeleted: false,
				},
			],
		};

		const dto = MenuItemMapper.toDetailsResponseDto(detailsAggregate);

		expect(dto).toEqual({
			id: "item-123",
			restaurantId: "rest-123",
			categoryId: "cat-123",
			categoryName: "Biryani",
			category: {
				id: "cat-123",
				name: "Biryani",
				description: "Delicious rice dishes",
			},
			name: "Chicken Biryani",
			description: "Classic dum biryani",
			price: 320.0,
			preparationTime: 25,
			calories: 600,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			images: [
				{
					id: "img-1",
					objectKey: "menu/biryani.png",
					displayOrder: 0,
				},
			],
			variants: [
				{
					id: "var-1",
					sku: "BIRYANI-FULL",
					name: "Full Portion",
					price: 320.0,
					isDefault: true,
					isAvailable: true,
				},
			],
			addons: [
				{
					id: "junc-1",
					addonId: "addon-1",
					name: "Extra Raita",
					description: "Cool cucumber yogurt",
					price: 30.0,
					priceOverride: 40.0,
					imageKey: "addons/raita.png",
					isAvailable: true,
				},
			],
			createdAt: now.toISOString(),
			updatedAt: now.toISOString(),
		});
	});
});
