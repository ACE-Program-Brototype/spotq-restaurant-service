export interface ActivateSubscriptionInput {
	eventId: string;
	subscriptionId: string;
	restaurantId: string;
	planCode: string;
	currentPeriodEnd: string;
}

export interface IActivateSubscriptionUseCase {
	execute(input: ActivateSubscriptionInput): Promise<boolean>;
}
