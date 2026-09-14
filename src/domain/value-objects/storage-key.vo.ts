import { InvalidStorageKeyError } from "@/domain/errors/storage.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export class StorageKeyVO {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawKey: string): StorageKeyVO {
		if (!rawKey || typeof rawKey !== "string") {
			throw new InvalidStorageKeyError(messages.STORAGE_KEY_REQUIRED);
		}

		const trimmed = rawKey.trim();

		if (!trimmed) {
			throw new InvalidStorageKeyError(messages.STORAGE_KEY_REQUIRED);
		}

		if (trimmed.includes("..")) {
			throw new InvalidStorageKeyError(messages.STORAGE_KEY_INVALID);
		}

		const normalized = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

		return new StorageKeyVO(normalized);
	}

	public get value(): string {
		return this._value;
	}

	public equals(other: StorageKeyVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
