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

	describe("update", () => {
		it("should partially update fields and refresh updatedAt", () => {
			const addon = Addon.create(validProps);
			const initialUpdatedAt = addon.updatedAt;

			addon.update({
				name: "Updated Cheese",
				description: "New melted cheese",
				price: 75,
				imageKey: "addons/cheese-v2.png",
				isAvailable: false,
			});

			expect(addon.name).toBe("Updated Cheese");
			expect(addon.description).toBe("New melted cheese");
			expect(addon.price).toBe(75);
			expect(addon.imageKey).toBe("addons/cheese-v2.png");
			expect(addon.isAvailable).toBe(false);
			expect(addon.updatedAt.getTime()).toBeGreaterThanOrEqual(
				initialUpdatedAt.getTime(),
			);
		});

		it("should allow updating nullable description and imageKey to null", () => {
			const addon = Addon.create(validProps);
			addon.update({ description: null, imageKey: null });

			expect(addon.description).toBeNull();
			expect(addon.imageKey).toBeNull();
			expect(addon.name).toBe("Extra Cheese");
		});

		it("should trim name and description on update", () => {
			const addon = Addon.create(validProps);
			addon.update({
				name: "  Trimmed Name  ",
				description: "  Trimmed Description  ",
				imageKey: "  trimmed/image.png  ",
			});

			expect(addon.name).toBe("Trimmed Name");
			expect(addon.description).toBe("Trimmed Description");
			expect(addon.imageKey).toBe("trimmed/image.png");
		});

		it("should throw InvalidAddonDataError when updating with empty name", () => {
			const addon = Addon.create(validProps);
			expect(() => addon.update({ name: "" })).toThrow(InvalidAddonDataError);
			expect(() => addon.update({ name: "   " })).toThrow(
				InvalidAddonDataError,
			);
		});

		it("should throw InvalidAddonDataError when updating with name exceeding 255 chars", () => {
			const addon = Addon.create(validProps);
			expect(() => addon.update({ name: "a".repeat(256) })).toThrow(
				InvalidAddonDataError,
			);
		});

		it("should throw InvalidAddonDataError when updating with description exceeding 1000 chars", () => {
			const addon = Addon.create(validProps);
			expect(() => addon.update({ description: "a".repeat(1001) })).toThrow(
				InvalidAddonDataError,
			);
		});

		it("should throw InvalidAddonDataError when updating with negative price", () => {
			const addon = Addon.create(validProps);
			expect(() => addon.update({ price: -5 })).toThrow(InvalidAddonDataError);
			expect(() => addon.update({ price: Number.NaN })).toThrow(
				InvalidAddonDataError,
			);
		});

		it("should throw InvalidAddonDataError when updating with invalid isAvailable type", () => {
			const addon = Addon.create(validProps);
			// biome-ignore lint/suspicious/noExplicitAny: test runtime type check
			expect(() => addon.update({ isAvailable: "invalid" as any })).toThrow(
				InvalidAddonDataError,
			);
		});
	});
});
