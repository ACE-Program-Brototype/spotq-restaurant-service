import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import { ActivateSubscriptionUseCase } from "@/application/use-cases/activate-subscription.use-case.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity";

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
			update: jest.fn(),
			save: jest.fn(),
			activateSubscription: jest.fn(),
		};
		mockEmailQueuePort = {
			sendVerificationOtp: jest.fn(),
			sendSubscriptionActivatedEmail: jest.fn(),
			sendStaffInvitation: jest.fn(),
		};
		useCase = new ActivateSubscriptionUseCase(
			mockRestaurantRepository,
			mockEmailQueuePort,
		);
		jest.clearAllMocks();
	});

	it("should activate subscription, fetch restaurant and enqueue activation email", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(true);
		const mockRestaurant = Restaurant.create({
			id: "rest-123",
			restaurantName: "Spicy Treats",
			ownerName: "John Doe",
			ownerEmail: "owner@spicytreats.com",
			email: "owner@spicytreats.com",
			phone: "1234567890",
		});
		mockRestaurantRepository.findById.mockResolvedValueOnce(mockRestaurant);

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
			eventId: "evt-123",
		});
	});

	it("should attempt to enqueue activation email even if event was already recorded on retry", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(false);
		const mockRestaurant = Restaurant.create({
			id: "rest-123",
			restaurantName: "Spicy Treats",
			ownerName: "John Doe",
			ownerEmail: "owner@spicytreats.com",
			email: "owner@spicytreats.com",
			phone: "1234567890",
		});
		mockRestaurantRepository.findById.mockResolvedValueOnce(mockRestaurant);

		const input = {
			eventId: "evt-retry",
			subscriptionId: "sub-123",
			restaurantId: "rest-123",
			planCode: "QUEUE_PRO",
			currentPeriodEnd: "2026-10-01T00:00:00.000Z",
		};

		const result = await useCase.execute(input);

		expect(result).toBe(false);
		expect(mockRestaurantRepository.findById).toHaveBeenCalledWith("rest-123");
		expect(
			mockEmailQueuePort.sendSubscriptionActivatedEmail,
		).toHaveBeenCalledWith({
			to: "owner@spicytreats.com",
			ownerName: "John Doe",
			restaurantName: "Spicy Treats",
			planCode: "QUEUE_PRO",
			subscriptionEndsAt: new Date("2026-10-01T00:00:00.000Z"),
			eventId: "evt-retry",
		});
	});

	it("should return false and not send email if restaurant has no email", async () => {
		mockRestaurantRepository.activateSubscription.mockResolvedValueOnce(false);
		mockRestaurantRepository.findById.mockResolvedValueOnce(null);

		const input = {
			eventId: "evt-no-email",
			subscriptionId: "sub-123",
			restaurantId: "rest-123",
			planCode: "QUEUE_PRO",
			currentPeriodEnd: "2026-10-01T00:00:00.000Z",
		};

		const result = await useCase.execute(input);

		expect(result).toBe(false);
		expect(mockRestaurantRepository.findById).toHaveBeenCalledWith("rest-123");
		expect(
			mockEmailQueuePort.sendSubscriptionActivatedEmail,
		).not.toHaveBeenCalled();
	});
});
