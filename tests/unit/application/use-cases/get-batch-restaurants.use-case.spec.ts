import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GetBatchRestaurantsUseCase } from "@/application/use-cases/internal/get-batch-restaurants.use-case.ts";
import type {
	IRestaurantRepository,
	RestaurantBatchItemRecord,
} from "@/domain/repositories/restaurant.repository.interface.ts";

describe("GetBatchRestaurantsUseCase", () => {
	let restaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: GetBatchRestaurantsUseCase;

	beforeEach(() => {
		restaurantRepository = {
			findBatchByIds: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new GetBatchRestaurantsUseCase(restaurantRepository);
	});

	it("should return empty array if restaurantIds array is empty", async () => {
		const result = await useCase.execute({ restaurantIds: [] });

		expect(result).toEqual([]);
		expect(restaurantRepository.findBatchByIds).not.toHaveBeenCalled();
	});

	it("should return empty array if input or restaurantIds is null or undefined", async () => {
		expect(
			await useCase.execute(null as unknown as { restaurantIds: string[] }),
		).toEqual([]);
		expect(
			await useCase.execute(undefined as unknown as { restaurantIds: string[] }),
		).toEqual([]);
		expect(
			await useCase.execute({
				restaurantIds: null as unknown as string[],
			}),
		).toEqual([]);
		expect(
			await useCase.execute({
				restaurantIds: undefined as unknown as string[],
			}),
		).toEqual([]);
		expect(restaurantRepository.findBatchByIds).not.toHaveBeenCalled();
	});

	it("should return empty array if restaurantIds only contain whitespace strings", async () => {
		const result = await useCase.execute({ restaurantIds: ["   ", ""] });

		expect(result).toEqual([]);
		expect(restaurantRepository.findBatchByIds).not.toHaveBeenCalled();
	});

	it("should deduplicate IDs, query repository and map records accurately", async () => {
		const id1 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		const id2 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
		const endsAt = new Date("2026-12-31T23:59:59.000Z");

		const mockRecords: RestaurantBatchItemRecord[] = [
			{
				id: id1,
				restaurantName: "Spice Garden",
				ownerName: "Alice Chef",
				ownerEmail: "alice@example.com",
				email: "info@spicegarden.com",
				phone: "+1234567890",
				status: "ACTIVE",
				onboardingStatus: "COMPLETED",
				isBlocked: false,
				blockReason: null,
				isSubscriptionActive: true,
				subscriptionPlanCode: "PRO_MONTHLY",
				subscriptionEndsAt: endsAt,
			},
			{
				id: id2,
				restaurantName: "Bistro Delight",
				ownerName: "Bob Owner",
				ownerEmail: "bob@example.com",
				email: "contact@bistro.com",
				phone: "+1987654321",
				status: "PENDING",
				onboardingStatus: "BASIC_INFO",
				isBlocked: true,
				blockReason: "Pending verification",
				isSubscriptionActive: false,
				subscriptionPlanCode: null,
				subscriptionEndsAt: null,
			},
		];

		restaurantRepository.findBatchByIds.mockResolvedValue(mockRecords);

		const result = await useCase.execute({
			restaurantIds: [id1, id2, id1, `  ${id2}  `],
		});

		expect(restaurantRepository.findBatchByIds).toHaveBeenCalledWith([
			id1,
			id2,
		]);
		expect(result).toEqual([
			{
				id: id1,
				restaurantName: "Spice Garden",
				ownerName: "Alice Chef",
				ownerEmail: "alice@example.com",
				email: "info@spicegarden.com",
				phone: "+1234567890",
				status: "ACTIVE",
				onboardingStatus: "COMPLETED",
				isBlocked: false,
				blockReason: null,
				isSubscriptionActive: true,
				subscriptionPlanCode: "PRO_MONTHLY",
				subscriptionEndsAt: "2026-12-31T23:59:59.000Z",
			},
			{
				id: id2,
				restaurantName: "Bistro Delight",
				ownerName: "Bob Owner",
				ownerEmail: "bob@example.com",
				email: "contact@bistro.com",
				phone: "+1987654321",
				status: "PENDING",
				onboardingStatus: "BASIC_INFO",
				isBlocked: true,
				blockReason: "Pending verification",
				isSubscriptionActive: false,
				subscriptionPlanCode: null,
				subscriptionEndsAt: null,
			},
		]);
	});
});
