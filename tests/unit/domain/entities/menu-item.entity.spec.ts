import { describe, expect, it } from "@jest/globals";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { InvalidMenuItemDataError } from "@/domain/errors/menu-item.errors.ts";

describe("MenuItem Entity", () => {
	const validRestaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validCategoryId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01";

	it("should create a MenuItem entity successfully", () => {
		const item = MenuItem.create({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
			name: "Gourmet Truffle Burger",
			description: "Delicious freshly ground burger with truffle mayo",
			price: 24.5,
			preparationTime: 15,
			calories: 750,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
		});

		expect(item.id).toBeDefined();
		expect(item.restaurantId).toBe(validRestaurantId);
		expect(item.categoryId).toBe(validCategoryId);
		expect(item.name).toBe("Gourmet Truffle Burger");
		expect(item.price).toBe(24.5);
		expect(item.preparationTime).toBe(15);
		expect(item.calories).toBe(750);
		expect(item.isVegetarian).toBe(false);
		expect(item.isFeatured).toBe(true);
		expect(item.isAvailable).toBe(true);
		expect(item.createdAt).toBeInstanceOf(Date);
		expect(item.updatedAt).toBeInstanceOf(Date);
	});

	it("should throw InvalidMenuItemDataError if name is empty", () => {
		expect(() =>
			MenuItem.create({
				restaurantId: validRestaurantId,
				categoryId: validCategoryId,
				name: "   ",
				price: 10,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError if price is negative", () => {
		expect(() =>
			MenuItem.create({
				restaurantId: validRestaurantId,
				categoryId: validCategoryId,
				name: "Burger",
				price: -5,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should update properties and availability correctly", () => {
		const item = MenuItem.create({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
			name: "Burger",
			price: 15,
		});

		item.update({
			name: "Updated Burger",
			price: 18,
		});

		expect(item.name).toBe("Updated Burger");
		expect(item.price).toBe(18);

		item.updateAvailability(false);
		expect(item.isAvailable).toBe(false);
	});

	it("should throw InvalidMenuItemDataError if restaurantId or categoryId is missing", () => {
		expect(() =>
			MenuItem.create({
				restaurantId: "",
				categoryId: validCategoryId,
				name: "Burger",
				price: 10,
			}),
		).toThrow(InvalidMenuItemDataError);

		expect(() =>
			MenuItem.create({
				restaurantId: validRestaurantId,
				categoryId: "",
				name: "Burger",
				price: 10,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError if prep time or calories are out of bounds", () => {
		expect(() =>
			MenuItem.create({
				restaurantId: validRestaurantId,
				categoryId: validCategoryId,
				name: "Burger",
				price: 10,
				preparationTime: -1,
			}),
		).toThrow(InvalidMenuItemDataError);

		expect(() =>
			MenuItem.create({
				restaurantId: validRestaurantId,
				categoryId: validCategoryId,
				name: "Burger",
				price: 10,
				calories: -10,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should validate and update all fields in update method", () => {
		const item = MenuItem.create({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
			name: "Burger",
			price: 15,
		});

		item.update({
			categoryId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02",
			description: "Updated description",
			preparationTime: 25,
			calories: 500,
			isVegetarian: true,
			isFeatured: true,
			isAvailable: true,
		});

		expect(item.categoryId).toBe("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02");
		expect(item.description).toBe("Updated description");
		expect(item.preparationTime).toBe(25);
		expect(item.calories).toBe(500);
		expect(item.isVegetarian).toBe(true);
		expect(item.isFeatured).toBe(true);
	});
});
