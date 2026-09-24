import { describe, expect, it } from "@jest/globals";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { InvalidVariantDataError } from "@/domain/errors/menu-item.errors.ts";

describe("MenuItemVariant Entity", () => {
	const validProps = {
		menuItemId: "item-123",
		sku: "BIRYANI-FULL",
		name: "Full Portion",
		price: 320.0,
		isDefault: true,
	};

	it("should create a valid MenuItemVariant with defaults", () => {
		const variant = MenuItemVariant.create(validProps);

		expect(variant.id).toBeDefined();
		expect(variant.menuItemId).toBe("item-123");
		expect(variant.sku).toBe("BIRYANI-FULL");
		expect(variant.name).toBe("Full Portion");
		expect(variant.price).toBe(320.0);
		expect(variant.isDefault).toBe(true);
		expect(variant.createdAt).toBeInstanceOf(Date);
		expect(variant.updatedAt).toBeInstanceOf(Date);
	});

	it("should reconstitute a MenuItemVariant properly", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const variant = MenuItemVariant.reconstitute({
			id: "var-123",
			menuItemId: "item-123",
			sku: "BIRYANI-HALF",
			name: "Half Portion",
			price: 200.0,
			isDefault: false,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(variant.id).toBe("var-123");
		expect(variant.sku).toBe("BIRYANI-HALF");
		expect(variant.name).toBe("Half Portion");
		expect(variant.price).toBe(200.0);
		expect(variant.isDefault).toBe(false);
	});

	it("should throw InvalidVariantDataError when name is empty", () => {
		expect(() =>
			MenuItemVariant.create({
				...validProps,
				name: "   ",
			}),
		).toThrow(InvalidVariantDataError);
	});

	it("should throw InvalidVariantDataError when price is negative", () => {
		expect(() =>
			MenuItemVariant.create({
				...validProps,
				price: -50,
			}),
		).toThrow(InvalidVariantDataError);
	});

	it("should allow assigning menuItemId and updating default status", () => {
		const variant = MenuItemVariant.create({
			name: "Quarter Portion",
			price: 120.0,
		});
		expect(variant.menuItemId).toBe("");
		expect(variant.isDefault).toBe(false);

		variant.assignMenuItemId("item-456");
		expect(variant.menuItemId).toBe("item-456");

		variant.setDefault(true);
		expect(variant.isDefault).toBe(true);
	});
});
