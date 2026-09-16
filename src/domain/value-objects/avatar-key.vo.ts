import {
	InvalidStaffDataError,
	StaffForbiddenError,
} from "@/domain/errors/staff.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface AvatarKeyContext {
	restaurantId?: string;
	staffId?: string;
}

/**
 * Value Object validating S3 avatar keys for restaurant staff.
 * Ensures protection against directory traversal attacks and cross-tenant/staff avatar hijacking.
 */
export class StaffAvatarKey {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(
		rawKey: string,
		context?: AvatarKeyContext,
	): StaffAvatarKey {
		if (!rawKey || typeof rawKey !== "string") {
			throw new InvalidStaffDataError(messages.INVALID_AVATAR_KEY);
		}

		const trimmed = rawKey.trim();

		if (
			trimmed.includes("..") ||
			trimmed.startsWith("/") ||
			trimmed.startsWith("\\")
		) {
			throw new InvalidStaffDataError(messages.INVALID_AVATAR_KEY);
		}

		const segments = trimmed.split(/[\\/]/).filter(Boolean);

		if (segments.length === 0) {
			throw new InvalidStaffDataError(messages.INVALID_AVATAR_KEY);
		}

		if (context?.restaurantId) {
			const restaurantIndex = segments.indexOf("restaurants");
			if (restaurantIndex !== -1) {
				const actualRestaurantId = segments[restaurantIndex + 1];
				if (!actualRestaurantId || actualRestaurantId !== context.restaurantId) {
					throw new StaffForbiddenError(messages.AVATAR_RESTAURANT_MISMATCH);
				}
			}
		}

		if (context?.staffId) {
			const staffIndex = segments.indexOf("staff");
			if (staffIndex !== -1) {
				const actualStaffId = segments[staffIndex + 1];
				if (!actualStaffId || actualStaffId !== context.staffId) {
					throw new StaffForbiddenError(messages.AVATAR_STAFF_MISMATCH);
				}
			}
		}

		return new StaffAvatarKey(trimmed);
	}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}
}
