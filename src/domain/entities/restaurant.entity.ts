import {
	InvalidRestaurantDataError,
	messages,
} from "@/domain/errors/restaurant.errors.ts";
import {
	type OnboardingStatus,
	OnboardingStatusVO,
} from "@/domain/value-objects/onboarding-status.vo.ts";
import {
	type RestaurantStatus,
	RestaurantStatusVO,
} from "@/domain/value-objects/restaurant-status.vo.ts";

export interface RestaurantProps {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: RestaurantStatusVO;
	onboardingStatus: OnboardingStatusVO;
	emailVerifiedAt: Date | null;
	isBlocked: boolean;
	blockReason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateRestaurantProps {
	id?: string;
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status?: string | RestaurantStatusVO;
	onboardingStatus?: string | OnboardingStatusVO;
	emailVerifiedAt?: Date | null;
	isBlocked?: boolean;
	blockReason?: string | null;
}

export interface ReconstituteRestaurantProps {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: string;
	onboardingStatus: string;
	emailVerifiedAt: Date | null;
	isBlocked: boolean;
	blockReason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class Restaurant {
	private _props: RestaurantProps;

	private constructor(props: RestaurantProps) {
		this._props = props;
	}

	public static create(props: CreateRestaurantProps): Restaurant {
		if (
			!props.restaurantName ||
			typeof props.restaurantName !== "string" ||
			props.restaurantName.trim().length < 2
		) {
			throw new InvalidRestaurantDataError(messages.RESTAUARANT_NAME_REQUIRED);
		}

		if (!props.email || typeof props.email !== "string") {
			throw new InvalidRestaurantDataError(messages.RESTAURANT_EMAIL_REQUIRED);
		}

		if (!props.phone || typeof props.phone !== "string") {
			throw new InvalidRestaurantDataError(messages.RESTAURANT_PHONE_REQUIRED);
		}

		if (
			!props.ownerName ||
			typeof props.ownerName !== "string" ||
			props.ownerName.trim().length < 2
		) {
			throw new InvalidRestaurantDataError(messages.OWNER_NAME_REQUIRED);
		}

		if (!props.ownerEmail || typeof props.ownerEmail !== "string") {
			throw new InvalidRestaurantDataError(messages.OWNER_EMAIL_REQUIRED);
		}

		const status =
			props.status instanceof RestaurantStatusVO
				? props.status
				: RestaurantStatusVO.create(
						typeof props.status === "string" ? props.status : "PENDING",
					);

		const onboardingStatus =
			props.onboardingStatus instanceof OnboardingStatusVO
				? props.onboardingStatus
				: OnboardingStatusVO.create(
						typeof props.onboardingStatus === "string"
							? props.onboardingStatus
							: "PENDING",
					);

		const now = new Date();
		const id = props.id || crypto.randomUUID();

		return new Restaurant({
			id,
			restaurantName: props.restaurantName.trim(),
			email: props.email.trim().toLowerCase(),
			phone: props.phone.trim(),
			ownerName: props.ownerName.trim(),
			ownerEmail: props.ownerEmail.trim().toLowerCase(),
			status,
			onboardingStatus,
			emailVerifiedAt: props.emailVerifiedAt ?? null,
			isBlocked: props.isBlocked ?? false,
			blockReason: props.blockReason ?? null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(props: ReconstituteRestaurantProps): Restaurant {
		return new Restaurant({
			id: props.id,
			restaurantName: props.restaurantName,
			email: props.email,
			phone: props.phone,
			ownerName: props.ownerName,
			ownerEmail: props.ownerEmail,
			status: RestaurantStatusVO.create(props.status),
			onboardingStatus: OnboardingStatusVO.create(props.onboardingStatus),
			emailVerifiedAt: props.emailVerifiedAt,
			isBlocked: props.isBlocked,
			blockReason: props.blockReason,
			createdAt: props.createdAt,
			updatedAt: props.updatedAt,
		});
	}

	public get id(): string {
		return this._props.id;
	}

	public get restaurantName(): string {
		return this._props.restaurantName;
	}

	public get email(): string {
		return this._props.email;
	}

	public get phone(): string {
		return this._props.phone;
	}

	public get ownerName(): string {
		return this._props.ownerName;
	}

	public get ownerEmail(): string {
		return this._props.ownerEmail;
	}

	public get status(): RestaurantStatus {
		return this._props.status.value;
	}

	public get statusVO(): RestaurantStatusVO {
		return this._props.status;
	}

	public get onboardingStatus(): OnboardingStatus {
		return this._props.onboardingStatus.value;
	}

	public get onboardingStatusVO(): OnboardingStatusVO {
		return this._props.onboardingStatus;
	}

	public get emailVerifiedAt(): Date | null {
		return this._props.emailVerifiedAt;
	}

	public get isBlocked(): boolean {
		return this._props.isBlocked;
	}

	public get blockReason(): string | null {
		return this._props.blockReason;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get updatedAt(): Date {
		return this._props.updatedAt;
	}

	public block(reason: string): void {
		if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
			throw new InvalidRestaurantDataError(messages.BLOCK_REASON_REQUIRED);
		}
		this._props.isBlocked = true;
		this._props.blockReason = reason.trim();
		this._props.updatedAt = new Date();
	}

	public unblock(): void {
		this._props.isBlocked = false;
		this._props.blockReason = null;
		this._props.updatedAt = new Date();
	}

	public verifyEmail(): void {
		this._props.emailVerifiedAt = new Date();
		this._props.updatedAt = new Date();
	}

	public completeOnboarding(): void {
		this._props.onboardingStatus = OnboardingStatusVO.create("COMPLETED");
		this._props.updatedAt = new Date();
	}

	public updateStatus(newStatus: string | RestaurantStatusVO): void {
		this._props.status =
			newStatus instanceof RestaurantStatusVO
				? newStatus
				: RestaurantStatusVO.create(newStatus);
		this._props.updatedAt = new Date();
	}

	public updateProfile(
		restaurantName?: string,
		phone?: string,
		ownerName?: string,
		ownerEmail?: string,
	): void {
		if (restaurantName !== undefined) {
			if (
				typeof restaurantName !== "string" ||
				restaurantName.trim().length < 2
			) {
				throw new InvalidRestaurantDataError(
					messages.RESTAUARANT_NAME_REQUIRED,
				);
			}
			this._props.restaurantName = restaurantName.trim();
		}

		if (phone !== undefined) {
			if (typeof phone !== "string" || phone.trim().length === 0) {
				throw new InvalidRestaurantDataError(
					messages.RESTAURANT_PHONE_REQUIRED,
				);
			}
			this._props.phone = phone.trim();
		}

		if (ownerName !== undefined) {
			if (typeof ownerName !== "string" || ownerName.trim().length < 2) {
				throw new InvalidRestaurantDataError(messages.OWNER_NAME_REQUIRED);
			}
			this._props.ownerName = ownerName.trim();
		}

		if (ownerEmail !== undefined) {
			if (typeof ownerEmail !== "string" || ownerEmail.trim().length === 0) {
				throw new InvalidRestaurantDataError(messages.OWNER_EMAIL_REQUIRED);
			}
			this._props.ownerEmail = ownerEmail.trim().toLowerCase();
		}

		this._props.updatedAt = new Date();
	}
}
