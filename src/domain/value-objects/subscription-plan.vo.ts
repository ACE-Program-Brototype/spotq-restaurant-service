export const SUBSCRIPTION_PLANS = ["QUEUE_PRO", "SELF_SERVICE_PRO"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export class SubscriptionPlanVO {
	private readonly _value: SubscriptionPlan;

	private constructor(value: SubscriptionPlan) {
		this._value = value;
	}

	public static create(rawPlan: string): SubscriptionPlanVO {
		const upperPlan = rawPlan?.toUpperCase() as SubscriptionPlan;
		if (!SUBSCRIPTION_PLANS.includes(upperPlan)) {
			throw new Error(`Invalid subscription plan: ${rawPlan}`);
		}
		return new SubscriptionPlanVO(upperPlan);
	}

	public get value(): SubscriptionPlan {
		return this._value;
	}

	public equals(other: SubscriptionPlanVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
