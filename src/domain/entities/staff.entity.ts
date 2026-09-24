import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface StaffProps {
	id: string;
	email: StaffEmail;
	fullname: string;
	phone: StaffPhone;
	passwordHash: string;
	avatarUrl: string | null;
	avatarUpdatedAt: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateStaffProps {
	id?: string;
	email: string | StaffEmail;
	fullname: string;
	phone: string | StaffPhone;
	passwordHash: string;
	avatarUrl?: string | null;
	avatarUpdatedAt?: Date | null;
}

export interface ReconstituteStaffProps {
	id: string;
	email: string;
	fullname: string;
	phone: string;
	passwordHash: string;
	avatarUrl?: string | null;
	avatarUpdatedAt?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export class Staff {
	private _props: StaffProps;

	private constructor(props: StaffProps) {
		this._props = props;
	}

	public static create(props: CreateStaffProps): Staff {
		if (
			!props.fullname ||
			typeof props.fullname !== "string" ||
			props.fullname.trim().length < 2
		) {
			throw new InvalidStaffDataError(messages.FULLNAME_INVALID);
		}

		if (!props.passwordHash || typeof props.passwordHash !== "string") {
			throw new InvalidStaffDataError(messages.PASSWORD_HASH_REQUIRED);
		}

		const email =
			props.email instanceof StaffEmail
				? props.email
				: StaffEmail.create(props.email);

		const phone =
			props.phone instanceof StaffPhone
				? props.phone
				: StaffPhone.create(props.phone);

		const now = new Date();
		const id = props.id || crypto.randomUUID();

		return new Staff({
			id,
			fullname: props.fullname.trim(),
			email,
			phone,
			passwordHash: props.passwordHash,
			avatarUrl: props.avatarUrl ?? null,
			avatarUpdatedAt:
				props.avatarUpdatedAt !== undefined
					? props.avatarUpdatedAt
					: props.avatarUrl
						? now
						: null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(props: ReconstituteStaffProps): Staff {
		const now = new Date();
		return new Staff({
			id: props.id,
			fullname: props.fullname,
			email: StaffEmail.create(props.email),
			phone: StaffPhone.create(props.phone),
			passwordHash: props.passwordHash,
			avatarUrl: props.avatarUrl ?? null,
			avatarUpdatedAt:
				props.avatarUpdatedAt !== undefined
					? props.avatarUpdatedAt
					: props.avatarUrl
						? (props.updatedAt ?? now)
						: null,
			createdAt: props.createdAt ?? now,
			updatedAt: props.updatedAt ?? now,
		});
	}

	public get id(): string {
		return this._props.id;
	}

	public get fullname(): string {
		return this._props.fullname;
	}

	public get email(): string {
		return this._props.email.value;
	}

	public get emailVO(): StaffEmail {
		return this._props.email;
	}

	public get phone(): string {
		return this._props.phone.value;
	}

	public get phoneVO(): StaffPhone {
		return this._props.phone;
	}

	public get passwordHash(): string {
		return this._props.passwordHash;
	}

	public get avatarUrl(): string | null {
		return this._props.avatarUrl;
	}

	public get avatarUpdatedAt(): Date | null {
		return this._props.avatarUpdatedAt;
	}

	public get createdAt(): Date {
		return this._props.createdAt ?? new Date();
	}

	public get updatedAt(): Date {
		return this._props.updatedAt ?? new Date();
	}

	public updateProfile(
		fullname?: string,
		phone?: string,
		avatar?: string | Date | null,
	): void {
		if (fullname !== undefined) {
			if (typeof fullname !== "string" || fullname.trim().length < 2) {
				throw new InvalidStaffDataError(messages.FULLNAME_INVALID);
			}
			this._props.fullname = fullname.trim();
		}

		if (phone !== undefined) {
			this._props.phone = StaffPhone.create(phone);
		}

		if (avatar !== undefined) {
			if (avatar instanceof Date) {
				this._props.avatarUpdatedAt = avatar;
			} else if (typeof avatar === "string") {
				this._props.avatarUrl = avatar;
				this._props.avatarUpdatedAt = new Date();
			} else if (avatar === null) {
				this._props.avatarUrl = null;
				this._props.avatarUpdatedAt = null;
			}
		}

		this._props.updatedAt = new Date();
	}

	public changePassword(newPasswordHash: string): void {
		if (!newPasswordHash || typeof newPasswordHash !== "string") {
			throw new InvalidStaffDataError(messages.PASSWORD_HASH_REQUIRED);
		}
		this._props.passwordHash = newPasswordHash;
		this._props.updatedAt = new Date();
	}
}
