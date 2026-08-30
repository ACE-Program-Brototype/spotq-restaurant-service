import { InvalidPhoneError } from "@/domain/errors/staff.errors.ts";

export class StaffPhone {
	private readonly _value: string;
	private static readonly PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawPhone: string): StaffPhone {
		if (!rawPhone || typeof rawPhone !== "string") {
			throw new InvalidPhoneError("Phone number is required");
		}

		const cleaned = rawPhone.trim();

		if (!StaffPhone.PHONE_REGEX.test(cleaned)) {
			throw new InvalidPhoneError(`Invalid phone number format: ${rawPhone}`);
		}

		return new StaffPhone(cleaned);
	}

	public get value(): string {
		return this._value;
	}

	public equals(other: StaffPhone): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
