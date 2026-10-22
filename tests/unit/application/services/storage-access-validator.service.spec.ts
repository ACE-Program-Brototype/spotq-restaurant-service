import { beforeEach, describe, expect, it } from "@jest/globals";
import { UnauthorizedEntityAccessError } from "@/application/errors/unauthorized-entity-access.error";
import { StorageAccessValidatorService } from "@/application/services/storage-access-validator.service";

describe("StorageAccessValidatorService", () => {
	let validator: StorageAccessValidatorService;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const otherRestaurantId = "b2ffcd00-0d1c-5fa9-cc7e-7cc0ce491b22";
	const userId = "c3aabcd1-1e2f-4aa1-bb2c-8dd1ee592c33";
	const otherUserId = "d4bbced2-2f3a-5bb2-cc3d-9ee2ff603d44";

	beforeEach(() => {
		validator = new StorageAccessValidatorService();
	});

	describe("Restaurant ownership", () => {
		it("allows restaurant owner to access their own restaurant files", () => {
			const key = `restaurants/${restaurantId}/documents/fssai.pdf`;
			expect(() =>
				validator.validateOwnership(key, { restaurantId, role: "RESTAURANT" }),
			).not.toThrow();
		});

		it("allows restaurant owner when key uses singular restaurant/ prefix", () => {
			const key = `restaurant/${restaurantId}/menu/item.jpg`;
			expect(() =>
				validator.validateOwnership(key, { restaurantId, role: "RESTAURANT" }),
			).not.toThrow();
		});

		it("throws UnauthorizedEntityAccessError for foreign restaurant key", () => {
			const foreignKey = `restaurants/${otherRestaurantId}/documents/fssai.pdf`;
			expect(() =>
				validator.validateOwnership(foreignKey, {
					restaurantId,
					role: "RESTAURANT",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});
	});

	describe("User & Staff ownership", () => {
		it("allows user to access their own profile files", () => {
			const key = `users/${userId}/profile/avatar.png`;
			expect(() =>
				validator.validateOwnership(key, { userId, role: "CUSTOMER" }),
			).not.toThrow();
		});

		it("throws UnauthorizedEntityAccessError for foreign user key", () => {
			const foreignKey = `users/${otherUserId}/profile/avatar.png`;
			expect(() =>
				validator.validateOwnership(foreignKey, {
					userId,
					role: "CUSTOMER",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});

		it("allows staff to delete their own avatar", () => {
			const staffId = "staff-1";
			const avatarKey = `restaurants/${restaurantId}/staff/${staffId}/avatar.png`;
			expect(() =>
				validator.validateOwnership(avatarKey, {
					userId: staffId,
					restaurantId,
					role: "STAFF",
				}),
			).not.toThrow();
		});

		it("throws UnauthorizedEntityAccessError when staff tries to access another staff member's avatar", () => {
			const staffId = "staff-1";
			const otherStaffId = "staff-2";
			const avatarKey = `restaurants/${restaurantId}/staff/${otherStaffId}/avatar.png`;
			expect(() =>
				validator.validateOwnership(avatarKey, {
					userId: staffId,
					restaurantId,
					role: "STAFF",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});

		it("throws UnauthorizedEntityAccessError when staff tries to delete restaurant documents", () => {
			const staffId = "staff-1";
			const docKey = `restaurants/${restaurantId}/documents/fssai.pdf`;
			expect(() =>
				validator.validateOwnership(docKey, {
					userId: staffId,
					restaurantId,
					role: "STAFF",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});

		it("throws UnauthorizedEntityAccessError when staff tries to delete restaurant menu assets", () => {
			const staffId = "staff-1";
			const menuKey = `restaurants/${restaurantId}/menu/item.jpg`;
			expect(() =>
				validator.validateOwnership(menuKey, {
					userId: staffId,
					restaurantId,
					role: "STAFF",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});
	});

	describe("Admin bypass", () => {
		it("allows admin to access any storage key", () => {
			const anyKey = `restaurants/${otherRestaurantId}/documents/fssai.pdf`;
			expect(() =>
				validator.validateOwnership(anyKey, {
					userId: "admin-1",
					role: "admin",
				}),
			).not.toThrow();
		});
	});

	describe("Invalid auth context or key structure", () => {
		it("throws UnauthorizedEntityAccessError when authContext is missing", () => {
			const key = `restaurants/${restaurantId}/documents/fssai.pdf`;
			expect(() => validator.validateOwnership(key, undefined)).toThrow(
				UnauthorizedEntityAccessError,
			);
		});

		it("throws UnauthorizedEntityAccessError when key has fewer than 2 segments", () => {
			expect(() =>
				validator.validateOwnership("invalidkey", {
					restaurantId,
					role: "RESTAURANT",
				}),
			).toThrow(UnauthorizedEntityAccessError);
		});
	});
});
