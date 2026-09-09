import { InvalidRestaurantStatusError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const RESTAURANT_STATUSES = [
	"PENDING",
	"APPROVED",
	"REJECTED",
	"SUSPENDED",
	"ACTIVE",
	"INACTIVE",
] as const;

export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

export class RestaurantStatusVO {
	private readonly _value: RestaurantStatus;

	private constructor(value: RestaurantStatus) {
		this._value = value;
	}

	public static create(rawStatus: string): RestaurantStatusVO {
		const upperStatus = rawStatus?.toUpperCase() as RestaurantStatus;
		if (!RESTAURANT_STATUSES.includes(upperStatus)) {
			throw new InvalidRestaurantStatusError(
				messages.INVALID_RESTAURANT_STATUS || `Invalid restaurant status: ${rawStatus}`,
			);
		}
		return new RestaurantStatusVO(upperStatus);
	}

	public get value(): RestaurantStatus {
		return this._value;
	}

	public isPending(): boolean {
		return this._value === "PENDING";
	}

	public isApproved(): boolean {
		return this._value === "APPROVED";
	}

	public isActive(): boolean {
		return this._value === "ACTIVE";
	}

	public isSuspended(): boolean {
		return this._value === "SUSPENDED";
	}

	public equals(other: RestaurantStatusVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
