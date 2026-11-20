export interface IGetTableAvailabilityUseCase {
	execute(input: {
		restaurantId: string;
		partySize: number;
	}): Promise<{
		restaurantId: string;
		isOpen: boolean;
		acceptsQueue: boolean;
		isTableAvailable: boolean;
		availableCount: number;
	}>;
}
