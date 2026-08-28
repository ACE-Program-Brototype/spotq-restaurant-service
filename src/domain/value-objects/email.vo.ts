import { InvalidEmailError } from "@/domain/errors/staff.errors.ts";

export class StaffEmail {
	private readonly _value: string;
	private static readonly EMAIL_REGEX =
		/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawEmail: string): StaffEmail {
		if (!rawEmail || typeof rawEmail !== "string") {
			throw new InvalidEmailError("Email is required");
		}

		const normalized = rawEmail.trim().toLowerCase();

		if (!StaffEmail.EMAIL_REGEX.test(normalized)) {
			throw new InvalidEmailError(`Invalid email format: ${rawEmail}`);
		}

		return new StaffEmail(normalized);
	}

	public get value(): string {
		return this._value;
	}

	public equals(other: StaffEmail): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
