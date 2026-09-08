import { InvalidOnboardingStatusError } from "@/domain/errors/restaurant.errors.ts";

export const ONBOARDING_STATUSES = ["PENDING", "COMPLETED"] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export class OnboardingStatusVO {
	private readonly _value: OnboardingStatus;

	private constructor(value: OnboardingStatus) {
		this._value = value;
	}

	public static create(rawStatus: string): OnboardingStatusVO {
		const upperStatus = rawStatus?.toUpperCase() as OnboardingStatus;
		if (!ONBOARDING_STATUSES.includes(upperStatus)) {
			throw new InvalidOnboardingStatusError(
				`Invalid onboarding status: ${rawStatus}. Valid statuses: ${ONBOARDING_STATUSES.join(", ")}`,
			);
		}
		return new OnboardingStatusVO(upperStatus);
	}

	public get value(): OnboardingStatus {
		return this._value;
	}

	public isPending(): boolean {
		return this._value === "PENDING";
	}

	public isCompleted(): boolean {
		return this._value === "COMPLETED";
	}

	public equals(other: OnboardingStatusVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
