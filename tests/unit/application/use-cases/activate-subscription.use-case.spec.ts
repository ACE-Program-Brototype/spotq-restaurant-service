import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ActivateSubscriptionUseCase } from "@/application/use-cases/activate-subscription.use-case.ts";

describe("ActivateSubscriptionUseCase", () => {
	let useCase: ActivateSubscriptionUseCase;
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;

	beforeEach(() => {
		mockRestaurantRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findUnique: jest.fn(),
			find: jest.fn(),
			existsByEmail: jest.fn(),
			createRestaurant: jest.fn(),
			findByEmail: jest.fn(),
			activateSubscription: jest.fn(),
		};
		useCase = new ActivateSubscriptionUseCase(mockRestaurantRepository);
		jest.clearAllMocks();
	});

	it("should call restaurantRepository.activateSubscription and return true on success", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(true);

		const input = {
			eventId: "evt-123",
			subscriptionId: "sub-123",
			restaurantId: "rest-123",
			planCode: "QUEUE_PRO",
			currentPeriodEnd: "2026-10-01T00:00:00.000Z",
		};

		const result = await useCase.execute(input);

		expect(result).toBe(true);
		expect(mockRestaurantRepository.activateSubscription).toHaveBeenCalledWith(
			"rest-123",
			"QUEUE_PRO",
			new Date("2026-10-01T00:00:00.000Z"),
			"evt-123",
		);
	});

	it("should return false if event was already processed", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(false);

		const input = {
			eventId: "evt-duplicate",
			subscriptionId: "sub-123",
			restaurantId: "rest-123",
			planCode: "QUEUE_PRO",
			currentPeriodEnd: "2026-10-01T00:00:00.000Z",
		};

		const result = await useCase.execute(input);

		expect(result).toBe(false);
	});
});
