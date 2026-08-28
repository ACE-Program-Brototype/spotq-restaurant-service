import { InvalidStaffStatusError } from "@/domain/errors/staff.errors.ts";

export const STAFF_STATUSES = [
	"ACTIVE",
	"INACTIVE",
	"SUSPENDED",
	"INVITED",
] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export class StaffStatusVO {
	private readonly _value: StaffStatus;

	private constructor(value: StaffStatus) {
		this._value = value;
	}

	public static create(rawStatus: string): StaffStatusVO {
		const upperStatus = rawStatus?.toUpperCase() as StaffStatus;
		if (!STAFF_STATUSES.includes(upperStatus)) {
			throw new InvalidStaffStatusError(
				`Invalid staff status: ${rawStatus}. Valid statuses: ${STAFF_STATUSES.join(", ")}`,
			);
		}
		return new StaffStatusVO(upperStatus);
	}

	public get value(): StaffStatus {
		return this._value;
	}

	public isActive(): boolean {
		return this._value === "ACTIVE";
	}

	public isSuspended(): boolean {
		return this._value === "SUSPENDED";
	}

	public equals(other: StaffStatusVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
