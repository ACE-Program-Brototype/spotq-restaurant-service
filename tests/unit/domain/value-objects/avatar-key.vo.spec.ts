import { describe, expect, it } from "@jest/globals";
import {
	InvalidStaffDataError,
	StaffForbiddenError,
} from "@/domain/errors/staff.errors.ts";
import { StaffAvatarKey } from "@/domain/value-objects/avatar-key.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("StaffAvatarKey Value Object", () => {
	const restaurantId = "11111111-1111-1111-1111-111111111111";
	const staffId = "22222222-2222-2222-2222-222222222222";

	it("should create a valid avatar key for nested restaurant/staff path", () => {
		const rawKey = `restaurants/${restaurantId}/staff/${staffId}/avatar/img.png`;
		const key = StaffAvatarKey.create(rawKey, { restaurantId, staffId });
		expect(key.value).toBe(rawKey);
		expect(key.toString()).toBe(rawKey);
	});

	it("should create a valid avatar key for direct staff path", () => {
		const rawKey = `staff/${staffId}/avatar/img.png`;
		const key = StaffAvatarKey.create(rawKey, { restaurantId, staffId });
		expect(key.value).toBe(rawKey);
	});

	it("should reject directory traversal in avatar key", () => {
		expect(() =>
			StaffAvatarKey.create(`../restaurants/${restaurantId}/avatar.png`, {
				restaurantId,
				staffId,
			}),
		).toThrow(InvalidStaffDataError);
	});

	it("should reject leading slashes in avatar key", () => {
		expect(() =>
			StaffAvatarKey.create(`/restaurants/${restaurantId}/avatar.png`, {
				restaurantId,
				staffId,
			}),
		).toThrow(InvalidStaffDataError);

		expect(() =>
			StaffAvatarKey.create(`\\restaurants\\${restaurantId}\\avatar.png`, {
				restaurantId,
				staffId,
			}),
		).toThrow(InvalidStaffDataError);
	});

	it("should throw StaffForbiddenError when restaurant ID in key mismatches expected restaurant", () => {
		const rawKey = `restaurants/other-res-id/staff/${staffId}/avatar.png`;
		expect(() =>
			StaffAvatarKey.create(rawKey, { restaurantId, staffId }),
		).toThrow(StaffForbiddenError);

		try {
			StaffAvatarKey.create(rawKey, { restaurantId, staffId });
		} catch (error) {
			expect((error as StaffForbiddenError).message).toBe(
				messages.AVATAR_RESTAURANT_MISMATCH,
			);
		}
	});

	it("should throw StaffForbiddenError when staff ID in key mismatches expected staff", () => {
		const rawKey = `restaurants/${restaurantId}/staff/other-staff-id/avatar.png`;
		expect(() =>
			StaffAvatarKey.create(rawKey, { restaurantId, staffId }),
		).toThrow(StaffForbiddenError);

		try {
			StaffAvatarKey.create(rawKey, { restaurantId, staffId });
		} catch (error) {
			expect((error as StaffForbiddenError).message).toBe(
				messages.AVATAR_STAFF_MISMATCH,
			);
		}
	});

	it("should reject empty or whitespace-only avatar keys", () => {
		expect(() => StaffAvatarKey.create("")).toThrow(InvalidStaffDataError);
		expect(() => StaffAvatarKey.create("   ")).toThrow(InvalidStaffDataError);
	});
});
