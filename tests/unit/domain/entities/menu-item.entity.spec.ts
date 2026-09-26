import { describe, expect, it } from "@jest/globals";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { InvalidMenuItemDataError } from "@/domain/errors/menu-item.errors.ts";

describe("MenuItem Entity", () => {
	const validProps = {
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		categoryId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
		name: "Chicken Dum Biryani",
		description: "Aromatic slow-cooked basmati rice",
		price: 320.0,
		preparationTime: 25,
		calories: 650,
		isVegetarian: false,
		isFeatured: true,
	};

	it("should create a valid MenuItem with defaults", () => {
		const item = MenuItem.create(validProps);

		expect(item.id).toBeDefined();
		expect(item.restaurantId).toBe(validProps.restaurantId);
		expect(item.categoryId).toBe(validProps.categoryId);
		expect(item.name).toBe("Chicken Dum Biryani");
		expect(item.description).toBe("Aromatic slow-cooked basmati rice");
		expect(item.price).toBe(320.0);
		expect(item.preparationTime).toBe(25);
		expect(item.calories).toBe(650);
		expect(item.isVegetarian).toBe(false);
		expect(item.isFeatured).toBe(true);
		expect(item.isAvailable).toBe(true);
		expect(item.createdAt).toBeInstanceOf(Date);
		expect(item.updatedAt).toBeInstanceOf(Date);
	});

	it("should reconstitute a MenuItem properly", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const item = MenuItem.reconstitute({
			id: "item-123",
			restaurantId: validProps.restaurantId,
			categoryId: validProps.categoryId,
			name: "Mutton Biryani",
			description: "Spiced mutton biryani",
			price: 450.0,
			preparationTime: 30,
			calories: 800,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: false,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(item.id).toBe("item-123");
		expect(item.name).toBe("Mutton Biryani");
		expect(item.price).toBe(450.0);
		expect(item.isAvailable).toBe(false);
	});

	it("should throw InvalidMenuItemDataError when name is empty", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				name: "   ",
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when price is negative", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				price: -10,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when restaurantId is missing", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				restaurantId: "",
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when categoryId is missing", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				categoryId: "",
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when preparationTime is negative", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				preparationTime: -5,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when calories is negative", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				calories: -100,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when price exceeds maximum boundary", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				price: 100000000,
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should throw InvalidMenuItemDataError when description exceeds 1000 characters", () => {
		expect(() =>
			MenuItem.create({
				...validProps,
				description: "a".repeat(1001),
			}),
		).toThrow(InvalidMenuItemDataError);
	});

	it("should update availability status", () => {
		const item = MenuItem.create(validProps);
		expect(item.isAvailable).toBe(true);

		item.updateAvailability(false);
		expect(item.isAvailable).toBe(false);
	});
});
