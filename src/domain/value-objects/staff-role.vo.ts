import { InvalidStaffRoleError } from "@/domain/errors/staff.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const STAFF_ROLES = ["STAFF"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export class StaffRoleVO {
	private readonly _value: StaffRole;

	private constructor(value: StaffRole) {
		this._value = value;
	}

	public static create(rawRole: string): StaffRoleVO {
		const upperRole = rawRole?.toUpperCase() as StaffRole;
		if (!STAFF_ROLES.includes(upperRole)) {
			throw new InvalidStaffRoleError(messages.INVALID_STAFF_ROLE);
		}
		return new StaffRoleVO(upperRole);
	}

	public static staff(): StaffRoleVO {
		return new StaffRoleVO("STAFF");
	}

	public get value(): StaffRole {
		return this._value;
	}

	public equals(other: StaffRoleVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
