import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";
import {
	type StaffRole,
	StaffRoleVO,
} from "@/domain/value-objects/staff-role.vo.ts";
import {
	type StaffStatus,
	StaffStatusVO,
} from "@/domain/value-objects/staff-status.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { Staff } from "./staff.entity.ts";

export interface RestaurantStaffProps {
	id: string;
	staffId: string;
	restaurantId: string;
	role: StaffRoleVO;
	status: StaffStatusVO;
	joinedAt?: Date | null;
	leftAt?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
	staff?: Staff;
}

export interface CreateRestaurantStaffProps {
	id?: string;
	staffId?: string;
	restaurantId: string;
	role?: string | StaffRoleVO;
	status?: string | StaffStatusVO;
	joinedAt?: Date | null;
	leftAt?: Date | null;
	staff?: Staff;

	// Optional compatibility fields when creating staff alongside membership
	fullname?: string;
	email?: string;
	phone?: string;
	avatarUpdatedAt?: Date | null;
	avatarUrl?: string | null;
	passwordHash?: string;
}

export interface ReconstituteRestaurantStaffProps {
	id: string;
	staffId?: string;
	restaurantId: string;
	role: string;
	status: string;
	joinedAt?: Date | null;
	leftAt?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
	staff?: Staff;

	// Compatibility fields if reconstituted from legacy or flattened joined query
	fullname?: string;
	email?: string;
	phone?: string;
	avatarUpdatedAt?: Date | null;
	avatarUrl?: string | null;
	passwordHash?: string;
}

export class RestaurantStaff {
	private _props: RestaurantStaffProps;

	private constructor(props: RestaurantStaffProps) {
		this._props = props;
	}

	public static create(props: CreateRestaurantStaffProps): RestaurantStaff {
		if (!props.restaurantId || typeof props.restaurantId !== "string") {
			throw new InvalidStaffDataError(messages.RESTAURANT_ID_REQUIRED);
		}

		let staff = props.staff;
		let staffId = props.staffId || props.id;

		if (!staff && props.email && props.fullname && props.passwordHash) {
			staff = Staff.create({
				id: staffId,
				email: props.email,
				fullname: props.fullname,
				phone: props.phone || "",
				passwordHash: props.passwordHash,
				avatarUpdatedAt: props.avatarUpdatedAt,
				avatarUrl: props.avatarUrl,
			});
			staffId = staff.id;
		}

		const id = props.id || crypto.randomUUID();
		if (!staffId && !staff) {
			staffId = id;
		} else if (staff && !staffId) {
			staffId = staff.id;
		}

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

		return new RestaurantStaff({
			id,
			staffId: staffId as string,
			restaurantId: props.restaurantId,
			role,
			status,
			joinedAt: props.joinedAt ?? now,
			leftAt: props.leftAt ?? null,
			createdAt: now,
			updatedAt: now,
			staff,
		});
	}

	public static reconstitute(
		props: ReconstituteRestaurantStaffProps,
	): RestaurantStaff {
		const now = new Date();

		let staff = props.staff;
		let staffId = props.staffId;

		if (!staff && props.email) {
			staff = Staff.reconstitute({
				id: staffId || props.id,
				email: props.email,
				fullname: props.fullname || "",
				phone: props.phone || "",
				passwordHash: props.passwordHash || "",
				avatarUrl: props.avatarUrl ?? null,
				avatarUpdatedAt: props.avatarUpdatedAt ?? null,
				createdAt: props.createdAt ?? now,
				updatedAt: props.updatedAt ?? now,
			});
			staffId = staff.id;
		}

		return new RestaurantStaff({
			id: props.id,
			staffId: (staffId || props.id) as string,
			restaurantId: props.restaurantId,
			role: StaffRoleVO.create(props.role),
			status: StaffStatusVO.create(props.status),
			joinedAt: props.joinedAt ?? now,
			leftAt: props.leftAt ?? null,
			createdAt: props.createdAt ?? now,
			updatedAt: props.updatedAt ?? now,
			staff,
		});
	}

	public get id(): string {
		return this._props.id;
	}

	public get staffId(): string {
		return this._props.staffId;
	}

	public get restaurantId(): string {
		return this._props.restaurantId;
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

	public get joinedAt(): Date | null {
		return this._props.joinedAt ?? null;
	}

	public get leftAt(): Date | null {
		return this._props.leftAt ?? null;
	}

	public get createdAt(): Date {
		return this._props.createdAt ?? new Date();
	}

	public get updatedAt(): Date {
		return this._props.updatedAt ?? new Date();
	}

	public get staff(): Staff | undefined {
		return this._props.staff;
	}

	public attachStaff(staff: Staff): void {
		this._props.staff = staff;
		this._props.staffId = staff.id;
	}

	// Convenience accessors delegating to attached Staff
	public get fullname(): string {
		return this._props.staff?.fullname ?? "";
	}

	public get email(): string {
		return this._props.staff?.email ?? "";
	}

	public get phone(): string {
		return this._props.staff?.phone ?? "";
	}

	public get avatarUrl(): string | null {
		return this._props.staff?.avatarUrl ?? null;
	}

	public get avatarUpdatedAt(): Date | null {
		return this._props.staff?.avatarUpdatedAt ?? null;
	}

	public get passwordHash(): string {
		return this._props.staff?.passwordHash ?? "";
	}

	public isActive(): boolean {
		return this._props.status.isActive();
	}

	public isSuspended(): boolean {
		return this._props.status.isSuspended();
	}

	public isRemoved(): boolean {
		return this._props.status.isRemoved();
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

	public remove(): void {
		this._props.status = StaffStatusVO.create("REMOVED");
		this._props.leftAt = new Date();
		this._props.updatedAt = new Date();
	}

	public changeRole(newRole: string | StaffRoleVO): void {
		this._props.role =
			newRole instanceof StaffRoleVO ? newRole : StaffRoleVO.create(newRole);
		this._props.updatedAt = new Date();
	}

	public updateProfile(
		fullname?: string,
		phone?: string,
		avatar?: string | Date | null,
	): void {
		if (this._props.staff) {
			this._props.staff.updateProfile(fullname, phone, avatar);
		}
		this._props.updatedAt = new Date();
	}

	public changePassword(newPasswordHash: string): void {
		if (this._props.staff) {
			this._props.staff.changePassword(newPasswordHash);
		}
		this._props.updatedAt = new Date();
	}
}
