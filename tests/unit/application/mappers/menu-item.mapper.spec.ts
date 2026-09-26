import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type { MenuItemAggregate } from "@/domain/repositories/menu-item.repository.interface.ts";

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
});
