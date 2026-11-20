import { InvalidStaffDataError } from "@/domain/errors/staff.errors.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";
import {
	type InvitationStatus,
	InvitationStatusVO,
} from "@/domain/value-objects/invitation-status.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface StaffInvitationProps {
	id: string;
	restaurantId: string;
	email: StaffEmail;
	tokenHash: string;
	status: InvitationStatusVO;
	expiresAt: Date;
	acceptedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateStaffInvitationProps {
	id?: string;
	restaurantId: string;
	email: string | StaffEmail;
	tokenHash: string;
	status?: string | InvitationStatusVO;
	expiresAt: Date;
	acceptedAt?: Date | null;
}

export interface ReconstituteStaffInvitationProps {
	id: string;
	restaurantId: string;
	email: string;
	tokenHash: string;
	status: string;
	expiresAt: Date;
	acceptedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export class StaffInvitation {
	private _props: StaffInvitationProps;

	private constructor(props: StaffInvitationProps) {
		this._props = props;
	}

	public static create(props: CreateStaffInvitationProps): StaffInvitation {
		if (!props.restaurantId || typeof props.restaurantId !== "string") {
			throw new InvalidStaffDataError(messages.RESTAURANT_ID_REQUIRED);
		}

		if (!props.tokenHash || typeof props.tokenHash !== "string") {
			throw new InvalidStaffDataError(messages.TOKEN_HASH_REQUIRED);
		}

		const email =
			props.email instanceof StaffEmail
				? props.email
				: StaffEmail.create(props.email);

		const status =
			props.status instanceof InvitationStatusVO
				? props.status
				: InvitationStatusVO.create(
						typeof props.status === "string" ? props.status : "PENDING",
					);

		const now = new Date();
		const id = props.id || crypto.randomUUID();

		return new StaffInvitation({
			id,
			restaurantId: props.restaurantId,
			email,
			tokenHash: props.tokenHash,
			status,
			expiresAt: props.expiresAt,
			acceptedAt: props.acceptedAt ?? null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		props: ReconstituteStaffInvitationProps,
	): StaffInvitation {
		return new StaffInvitation({
			id: props.id,
			restaurantId: props.restaurantId,
			email: StaffEmail.create(props.email),
			tokenHash: props.tokenHash,
			status: InvitationStatusVO.create(props.status),
			expiresAt: props.expiresAt,
			acceptedAt: props.acceptedAt,
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

	public get email(): string {
		return this._props.email.value;
	}

	public get emailVO(): StaffEmail {
		return this._props.email;
	}

	public get tokenHash(): string {
		return this._props.tokenHash;
	}

	public get status(): InvitationStatus {
		return this._props.status.value;
	}

	public get statusVO(): InvitationStatusVO {
		return this._props.status;
	}

	public get expiresAt(): Date {
		return this._props.expiresAt;
	}

	public get acceptedAt(): Date | null {
		return this._props.acceptedAt;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get updatedAt(): Date {
		return this._props.updatedAt;
	}

	public isPending(): boolean {
		return this._props.status.isPending() && !this.isExpired();
	}

	public isExpired(): boolean {
		return new Date() > this._props.expiresAt;
	}

	public accept(): void {
		this._props.status = InvitationStatusVO.accepted();
		this._props.acceptedAt = new Date();
		this._props.updatedAt = new Date();
	}

	public revoke(): void {
		this._props.status = InvitationStatusVO.revoked();
		this._props.updatedAt = new Date();
	}

	public markExpired(): void {
		this._props.status = InvitationStatusVO.expired();
		this._props.updatedAt = new Date();
	}

	public renew(newTokenHash: string, newExpiresAt: Date): void {
		if (this._props.status.isAccepted()) {
			throw new InvalidStaffDataError(
				messages.CANNOT_RENEW_ACCEPTED_INVITATION,
			);
		}
		this._props.tokenHash = newTokenHash;
		this._props.expiresAt = newExpiresAt;
		this._props.status = InvitationStatusVO.pending();
		this._props.updatedAt = new Date();
	}
}
