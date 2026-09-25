import { describe, expect, it } from "@jest/globals";
import { Addon } from "@/domain/entities/addon.entity.ts";
import { InvalidAddonDataError } from "@/domain/errors/addon.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("Addon Entity", () => {
	const validProps = {
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		name: "Extra Cheese",
		description: "Creamy melted cheese",
		price: 50.0,
		imageKey: "addons/cheese.png",
	};

	it("should create a valid Addon with defaults", () => {
		const addon = Addon.create(validProps);

		expect(addon.id).toBeDefined();
		expect(addon.restaurantId).toBe(validProps.restaurantId);
		expect(addon.name).toBe("Extra Cheese");
		expect(addon.description).toBe("Creamy melted cheese");
		expect(addon.price).toBe(50.0);
		expect(addon.imageKey).toBe("addons/cheese.png");
		expect(addon.isAvailable).toBe(true);
		expect(addon.createdAt).toBeInstanceOf(Date);
		expect(addon.updatedAt).toBeInstanceOf(Date);
	});

	it("should reconstitute an Addon properly", () => {
		const pastDate = new Date("2026-01-01T00:00:00Z");
		const addon = Addon.reconstitute({
			id: "addon-123",
			restaurantId: validProps.restaurantId,
			name: "Garlic Dip",
			description: "Garlic butter sauce",
			price: 35.0,
			imageKey: "addons/dip.png",
			isAvailable: false,
			createdAt: pastDate,
			updatedAt: pastDate,
		});

		expect(addon.id).toBe("addon-123");
		expect(addon.name).toBe("Garlic Dip");
		expect(addon.price).toBe(35.0);
		expect(addon.isAvailable).toBe(false);
	});

	it("should throw InvalidAddonDataError when name is empty", () => {
		expect(() =>
			Addon.create({
				...validProps,
				name: "   ",
			}),
		).toThrow(InvalidAddonDataError);
	});

	it("should throw InvalidAddonDataError when name exceeds 255 chars", () => {
		expect(() =>
			Addon.create({
				...validProps,
				name: "a".repeat(256),
			}),
		).toThrow(messages.ADDON_NAME_MAX_LENGTH);
	});

	it("should throw InvalidAddonDataError when restaurantId is missing", () => {
		expect(() =>
			Addon.create({
				...validProps,
				restaurantId: "",
			}),
		).toThrow(messages.INVALID_RESTAURANT_ID);
	});

	it("should throw InvalidAddonDataError when price is negative", () => {
		expect(() =>
			Addon.create({
				...validProps,
				price: -10,
			}),
		).toThrow(messages.ADDON_PRICE_NEGATIVE);
	});

	it("should throw InvalidAddonDataError when description exceeds 1000 chars", () => {
		expect(() =>
			Addon.create({
				...validProps,
				description: "a".repeat(1001),
			}),
		).toThrow(messages.ADDON_DESCRIPTION_MAX_LENGTH);
	});

	it("should update availability", () => {
		const addon = Addon.create(validProps);
		expect(addon.isAvailable).toBe(true);

		addon.updateAvailability(false);
		expect(addon.isAvailable).toBe(false);
	});
});
