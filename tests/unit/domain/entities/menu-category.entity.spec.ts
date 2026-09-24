import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import { InvalidCategoryDataError } from "@/domain/errors/menu-category.errors.ts";

describe("MenuCategory Entity", () => {
	const validProps = {
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		name: "Main Course",
		description: "Delicious main dishes",
		displayOrder: 1,
	};

	it("should create a MenuCategory entity successfully using factory create()", () => {
		const category = MenuCategory.create(validProps);

		expect(category.id).toBeDefined();
		expect(category.restaurantId).toBe(validProps.restaurantId);
		expect(category.name).toBe("Main Course");
		expect(category.description).toBe("Delicious main dishes");
		expect(category.displayOrder).toBe(1);
		expect(category.isActive).toBe(true);
		expect(category.createdAt).toBeInstanceOf(Date);
		expect(category.updatedAt).toBeInstanceOf(Date);
	});

	it("should set default displayOrder to 0 and isActive to true when omitted", () => {
		const category = MenuCategory.create({
			restaurantId: validProps.restaurantId,
			name: "Beverages",
		});

		expect(category.displayOrder).toBe(0);
		expect(category.isActive).toBe(true);
		expect(category.description).toBeNull();
	});

	it("should trim name and description upon creation", () => {
		const category = MenuCategory.create({
			restaurantId: validProps.restaurantId,
			name: "  Appetizers  ",
			description: "  Tasty starters  ",
		});

		expect(category.name).toBe("Appetizers");
		expect(category.description).toBe("Tasty starters");
	});

	it("should throw InvalidCategoryDataError when name is empty or whitespace", () => {
		expect(() =>
			MenuCategory.create({
				restaurantId: validProps.restaurantId,
				name: "",
			}),
		).toThrow(InvalidCategoryDataError);

		expect(() =>
			MenuCategory.create({
				restaurantId: validProps.restaurantId,
				name: "   ",
			}),
		).toThrow(InvalidCategoryDataError);
	});

	it("should throw InvalidCategoryDataError when name exceeds 255 characters", () => {
		const longName = "a".repeat(256);
		expect(() =>
			MenuCategory.create({
				restaurantId: validProps.restaurantId,
				name: longName,
			}),
		).toThrow(InvalidCategoryDataError);
	});

	it("should throw InvalidCategoryDataError when description exceeds 1000 characters", () => {
		const longDescription = "a".repeat(1001);
		expect(() =>
			MenuCategory.create({
				restaurantId: validProps.restaurantId,
				name: "Valid Category",
				description: longDescription,
			}),
		).toThrow(InvalidCategoryDataError);
	});

	it("should throw InvalidCategoryDataError when restaurantId is empty or whitespace", () => {
		expect(() =>
			MenuCategory.create({
				restaurantId: "",
				name: "Desserts",
			}),
		).toThrow(InvalidCategoryDataError);

		expect(() =>
			MenuCategory.create({
				restaurantId: "   ",
				name: "Desserts",
			}),
		).toThrow(InvalidCategoryDataError);
	});

	it("should reconstitute an existing MenuCategory without modification", () => {
		const pastDate = new Date("2026-01-01T10:00:00Z");
		const reconstituted = MenuCategory.reconstitute({
			id: "c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
			restaurantId: validProps.restaurantId,
			name: "Desserts",
			description: "Sweet treats",
			displayOrder: 5,
			isActive: false,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(reconstituted.id).toBe("c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a99");
		expect(reconstituted.restaurantId).toBe(validProps.restaurantId);
		expect(reconstituted.name).toBe("Desserts");
		expect(reconstituted.description).toBe("Sweet treats");
		expect(reconstituted.displayOrder).toBe(5);
		expect(reconstituted.isActive).toBe(false);
		expect(reconstituted.createdAt).toEqual(pastDate);
		expect(reconstituted.updatedAt).toEqual(pastDate);
	});
	describe("update", () => {
		it("should partially update fields and refresh updatedAt", () => {
			const category = MenuCategory.create(validProps);
			const initialUpdatedAt = category.updatedAt;

			category.update({
				name: "Updated Course",
				description: "New description",
				displayOrder: 3,
				isActive: false,
			});

			expect(category.name).toBe("Updated Course");
			expect(category.description).toBe("New description");
			expect(category.displayOrder).toBe(3);
			expect(category.isActive).toBe(false);
			expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(
				initialUpdatedAt.getTime(),
			);
		});

		it("should allow updating nullable description to null", () => {
			const category = MenuCategory.create(validProps);
			category.update({ description: null });

			expect(category.description).toBeNull();
			expect(category.name).toBe("Main Course");
		});

		it("should trim name and description on update", () => {
			const category = MenuCategory.create(validProps);
			category.update({
				name: "  Trimmed Name  ",
				description: "  Trimmed Description  ",
			});

			expect(category.name).toBe("Trimmed Name");
			expect(category.description).toBe("Trimmed Description");
		});

		it("should throw InvalidCategoryDataError when updating with empty name", () => {
			const category = MenuCategory.create(validProps);
			expect(() => category.update({ name: "" })).toThrow(
				InvalidCategoryDataError,
			);
			expect(() => category.update({ name: "   " })).toThrow(
				InvalidCategoryDataError,
			);
		});

		it("should throw InvalidCategoryDataError when updating with name exceeding 255 chars", () => {
			const category = MenuCategory.create(validProps);
			expect(() => category.update({ name: "a".repeat(256) })).toThrow(
				InvalidCategoryDataError,
			);
		});

		it("should throw InvalidCategoryDataError when updating with description exceeding 1000 chars", () => {
			const category = MenuCategory.create(validProps);
			expect(() => category.update({ description: "a".repeat(1001) })).toThrow(
				InvalidCategoryDataError,
			);
		});

		it("should throw InvalidCategoryDataError when updating with invalid displayOrder", () => {
			const category = MenuCategory.create(validProps);
			expect(() => category.update({ displayOrder: -1 })).toThrow(
				InvalidCategoryDataError,
			);
			expect(() => category.update({ displayOrder: 1.5 as number })).toThrow(
				InvalidCategoryDataError,
			);
		});
	});
});
