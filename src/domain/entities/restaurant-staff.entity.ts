import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";
import {
	type StaffRole,
	StaffRoleVO,
} from "@/domain/value-objects/staff-role.vo.ts";
import {
	type StaffStatus,
	StaffStatusVO,
} from "@/domain/value-objects/staff-status.vo.ts";

export interface RestaurantStaffProps {
	id: string;
	restaurantId: string;
	fullname: string;
	email: StaffEmail;
	phone: StaffPhone;
	avatarUrl: string | null;
	passwordHash: string;
	role: StaffRoleVO;
	status: StaffStatusVO;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateRestaurantStaffProps {
	id?: string;
	restaurantId: string;
	fullname: string;
	email: string | StaffEmail;
	phone: string | StaffPhone;
	avatarUrl?: string | null;
	passwordHash: string;
	role?: string | StaffRoleVO;
	status?: string | StaffStatusVO;
}

export interface ReconstituteRestaurantStaffProps {
	id: string;
	restaurantId: string;
	fullname: string;
	email: string;
	phone: string;
	avatarUrl: string | null;
	passwordHash: string;
	role: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export class RestaurantStaff {
	private _props: RestaurantStaffProps;

	private constructor(props: RestaurantStaffProps) {
		this._props = props;
	}

	public static create(props: CreateRestaurantStaffProps): RestaurantStaff {
		if (!props.restaurantId || typeof props.restaurantId !== "string") {
			throw new InvalidStaffDataError("Restaurant ID is required");
		}

		if (
			!props.fullname ||
			typeof props.fullname !== "string" ||
			props.fullname.trim().length < 2
		) {
			throw new InvalidStaffDataError(
				"Fullname is required and must be at least 2 characters",
			);
		}

		if (!props.passwordHash || typeof props.passwordHash !== "string") {
			throw new InvalidStaffDataError("Password hash is required");
		}

		const email =
			props.email instanceof StaffEmail
				? props.email
				: StaffEmail.create(props.email);

		const phone =
			props.phone instanceof StaffPhone
				? props.phone
				: StaffPhone.create(props.phone);

		const role =
			props.role instanceof StaffRoleVO
				? props.role
				: StaffRoleVO.create(
						typeof props.role === "string" ? props.role : "STAFF",
					);

		const status =
			props.status instanceof StaffStatusVO
				? props.status
				: StaffStatusVO.create(
						typeof props.status === "string" ? props.status : "ACTIVE",
					);

		const now = new Date();
		const id = props.id || crypto.randomUUID();

		return new RestaurantStaff({
			id,
			restaurantId: props.restaurantId,
			fullname: props.fullname.trim(),
			email,
			phone,
			avatarUrl: props.avatarUrl ?? null,
			passwordHash: props.passwordHash,
			role,
			status,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		props: ReconstituteRestaurantStaffProps,
	): RestaurantStaff {
		return new RestaurantStaff({
			id: props.id,
			restaurantId: props.restaurantId,
			fullname: props.fullname,
			email: StaffEmail.create(props.email),
			phone: StaffPhone.create(props.phone),
			avatarUrl: props.avatarUrl,
			passwordHash: props.passwordHash,
			role: StaffRoleVO.create(props.role),
			status: StaffStatusVO.create(props.status),
			createdAt: props.createdAt,
			updatedAt: props.updatedAt,
		});
	}

	public get id(): string {
		return this._props.id;
	}

	public get restaurantId(): string {
		return this._props.restaurantId;
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

	public get avatarUrl(): string | null {
		return this._props.avatarUrl;
	}

	public get passwordHash(): string {
		return this._props.passwordHash;
	}

	public get role(): StaffRole {
		return this._props.role.value;
	}

	public get roleVO(): StaffRoleVO {
		return this._props.role;
	}

	public get status(): StaffStatus {
		return this._props.status.value;
	}

	public get statusVO(): StaffStatusVO {
		return this._props.status;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get updatedAt(): Date {
		return this._props.updatedAt;
	}

	public isActive(): boolean {
		return this._props.status.isActive();
	}

	public isSuspended(): boolean {
		return this._props.status.isSuspended();
	}

	public updateProfile(
		fullname?: string,
		phone?: string,
		avatarUrl?: string | null,
	): void {
		if (fullname !== undefined) {
			if (typeof fullname !== "string" || fullname.trim().length < 2) {
				throw new InvalidStaffDataError(
					"Fullname must be at least 2 characters",
				);
			}
			this._props.fullname = fullname.trim();
		}

		if (phone !== undefined) {
			this._props.phone = StaffPhone.create(phone);
		}

		if (avatarUrl !== undefined) {
			this._props.avatarUrl = avatarUrl;
		}

		this._props.updatedAt = new Date();
	}

	public changePassword(newPasswordHash: string): void {
		if (!newPasswordHash || typeof newPasswordHash !== "string") {
			throw new InvalidStaffDataError("Valid password hash is required");
		}
		this._props.passwordHash = newPasswordHash;
		this._props.updatedAt = new Date();
	}

	public changeRole(newRole: string | StaffRoleVO): void {
		this._props.role =
			newRole instanceof StaffRoleVO ? newRole : StaffRoleVO.create(newRole);
		this._props.updatedAt = new Date();
	}

	public activate(): void {
		this._props.status = StaffStatusVO.create("ACTIVE");
		this._props.updatedAt = new Date();
	}

	public deactivate(): void {
		this._props.status = StaffStatusVO.create("INACTIVE");
		this._props.updatedAt = new Date();
	}

	public suspend(): void {
		this._props.status = StaffStatusVO.create("SUSPENDED");
		this._props.updatedAt = new Date();
	}
}
