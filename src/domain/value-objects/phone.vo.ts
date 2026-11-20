import { InvalidPhoneError } from "@/domain/errors/staff.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export class StaffPhone {
	private readonly _value: string;
	private static readonly INDIAN_PHONE_REGEX =
		/^(?:(?:\+91|91|0)[\s-]?)?[6-9]\d{9}$/;
	private static readonly GENERIC_PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

	private constructor(value: string) {
		this._value = value;
	}

	public static normalize(rawPhone: string): string {
		const cleaned = rawPhone.trim();
		if (StaffPhone.INDIAN_PHONE_REGEX.test(cleaned)) {
			const digits = cleaned.replace(/\D/g, "");
			const last10 = digits.slice(-10);
			return `+91${last10}`;
		}
		return cleaned.replace(/[\s-]/g, "");
	}

	public static create(rawPhone: string): StaffPhone {
		if (!rawPhone || typeof rawPhone !== "string") {
			throw new InvalidPhoneError(messages.PHONE_REQUIRED);
		}

		const cleaned = rawPhone.trim();

		if (
			!StaffPhone.GENERIC_PHONE_REGEX.test(cleaned) &&
			!StaffPhone.INDIAN_PHONE_REGEX.test(cleaned)
		) {
			throw new InvalidPhoneError(messages.INVALID_PHONE_FORMAT);
		}

		return new StaffPhone(StaffPhone.normalize(cleaned));
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
