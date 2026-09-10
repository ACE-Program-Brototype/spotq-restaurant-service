import type { Restaurant } from "@prisma/client";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import { ActivateSubscriptionUseCase } from "@/application/use-cases/activate-subscription.use-case.ts";

describe("ActivateSubscriptionUseCase", () => {
	let useCase: ActivateSubscriptionUseCase;
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
	let mockEmailQueuePort: jest.Mocked<IEmailQueuePort>;

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
		mockEmailQueuePort = {
			sendVerificationOtp: jest.fn(),
			sendSubscriptionActivatedEmail: jest.fn(),
		};
		useCase = new ActivateSubscriptionUseCase(
			mockRestaurantRepository,
			mockEmailQueuePort,
		);
		jest.clearAllMocks();
	});

	it("should activate subscription, fetch restaurant and enqueue activation email", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(true);
		mockRestaurantRepository.findById.mockResolvedValueOnce({
			id: "rest-123",
			restaurantName: "Spicy Treats",
			ownerName: "John Doe",
			ownerEmail: "owner@spicytreats.com",
		} as Restaurant);

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
		expect(mockRestaurantRepository.findById).toHaveBeenCalledWith("rest-123");
		expect(
			mockEmailQueuePort.sendSubscriptionActivatedEmail,
		).toHaveBeenCalledWith({
			to: "owner@spicytreats.com",
			ownerName: "John Doe",
			restaurantName: "Spicy Treats",
			planCode: "QUEUE_PRO",
			subscriptionEndsAt: new Date("2026-10-01T00:00:00.000Z"),
		});
	});

	it("should return false and not send email if event was already processed", async () => {
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
		expect(mockRestaurantRepository.findById).not.toHaveBeenCalled();
		expect(
			mockEmailQueuePort.sendSubscriptionActivatedEmail,
		).not.toHaveBeenCalled();
	});
});
