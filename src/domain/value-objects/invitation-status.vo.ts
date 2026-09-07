import { DomainError } from "@/domain/errors/domain.error.ts";

export class InvalidInvitationStatusError extends DomainError {
	public readonly code = "INVALID_INVITATION_STATUS";
	constructor(message = "Invalid invitation status specified") {
		super(message);
	}
}

export const INVITATION_STATUSES = [
	"PENDING",
	"ACCEPTED",
	"EXPIRED",
	"REVOKED",
] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export class InvitationStatusVO {
	private readonly _value: InvitationStatus;

	private constructor(value: InvitationStatus) {
		this._value = value;
	}

	public static create(rawStatus: string): InvitationStatusVO {
		const upperStatus = rawStatus?.toUpperCase() as InvitationStatus;
		if (!INVITATION_STATUSES.includes(upperStatus)) {
			throw new InvalidInvitationStatusError(
				`Invalid invitation status: ${rawStatus}. Valid statuses: ${INVITATION_STATUSES.join(", ")}`,
			);
		}
		return new InvitationStatusVO(upperStatus);
	}

	public static pending(): InvitationStatusVO {
		return new InvitationStatusVO("PENDING");
	}

	public static accepted(): InvitationStatusVO {
		return new InvitationStatusVO("ACCEPTED");
	}

	public static expired(): InvitationStatusVO {
		return new InvitationStatusVO("EXPIRED");
	}

	public static revoked(): InvitationStatusVO {
		return new InvitationStatusVO("REVOKED");
	}

	public get value(): InvitationStatus {
		return this._value;
	}

	public isPending(): boolean {
		return this._value === "PENDING";
	}

	public isAccepted(): boolean {
		return this._value === "ACCEPTED";
	}

	public isExpired(): boolean {
		return this._value === "EXPIRED";
	}

	public isRevoked(): boolean {
		return this._value === "REVOKED";
	}

	public equals(other: InvitationStatusVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
