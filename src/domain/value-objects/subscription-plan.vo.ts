export const SUBSCRIPTION_PLAN = {
	QUEUE_PRO: "QUEUE_PRO",
	SELF_PRO: "SELF_PRO",
	SELF_SERVICE_PRO: "SELF_SERVICE_PRO",
} as const;

export const SUBSCRIPTION_PLANS = [
	SUBSCRIPTION_PLAN.QUEUE_PRO,
	SUBSCRIPTION_PLAN.SELF_PRO,
	SUBSCRIPTION_PLAN.SELF_SERVICE_PRO,
] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export class SubscriptionPlanVO {
	private readonly _value: SubscriptionPlan;

	private constructor(value: SubscriptionPlan) {
		this._value = value;
	}

	public static create(rawPlan: string): SubscriptionPlanVO {
		const upperPlan = rawPlan?.trim().toUpperCase() as SubscriptionPlan;
		if (!SUBSCRIPTION_PLANS.includes(upperPlan)) {
			throw new Error(`Invalid subscription plan: ${rawPlan}`);
		}
		return new SubscriptionPlanVO(upperPlan);
	}

	public get value(): SubscriptionPlan {
		return this._value;
	}

	public hasQueueEntitlement(): boolean {
		return (
			this._value === SUBSCRIPTION_PLAN.QUEUE_PRO ||
			this._value === SUBSCRIPTION_PLAN.SELF_PRO
		);
	}

	public static hasQueueEntitlement(
		rawPlan: string | null | undefined,
	): boolean {
		if (!rawPlan) {
			return false;
		}
		const normalized = rawPlan.trim().toUpperCase();
		return (
			normalized === SUBSCRIPTION_PLAN.QUEUE_PRO ||
			normalized === SUBSCRIPTION_PLAN.SELF_PRO
		);
	}

	public equals(other: SubscriptionPlanVO): boolean {
		return this._value === other._value;
	}

	public toString(): string {
		return this._value;
	}
}
