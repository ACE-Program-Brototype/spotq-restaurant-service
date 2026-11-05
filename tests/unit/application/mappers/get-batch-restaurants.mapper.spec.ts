import { describe, expect, it } from "@jest/globals";
import { GetBatchRestaurantsMapper } from "@/application/mappers/internal/get-batch-restaurants.mapper.ts";
import type { RestaurantBatchItemRecord } from "@/domain/repositories/restaurant.repository.interface.ts";

describe("GetBatchRestaurantsMapper", () => {
	it("should map record to DTO with ISO date string", () => {
		const record: RestaurantBatchItemRecord = {
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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
			subscriptionEndsAt: new Date("2026-12-31T23:59:59.000Z"),
		};

		const dto = GetBatchRestaurantsMapper.toRestaurantBatchItemDTO(record);

		expect(dto).toEqual({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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
		});
	});

	it("should map subscriptionEndsAt null when date is null", () => {
		const record: RestaurantBatchItemRecord = {
			id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			restaurantName: "Cafe Delight",
			ownerName: "Bob Owner",
			ownerEmail: "bob@example.com",
			email: "contact@cafe.com",
			phone: "+1987654321",
			status: "PENDING",
			onboardingStatus: "BASIC_INFO",
			isBlocked: true,
			blockReason: "Pending verification",
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
		};

		const dto = GetBatchRestaurantsMapper.toRestaurantBatchItemDTO(record);

		expect(dto.subscriptionEndsAt).toBeNull();
		expect(dto.subscriptionPlanCode).toBeNull();
		expect(dto.restaurantId).toBe("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");
	});

	it("should map an array of records to DTO list", () => {
		const records: RestaurantBatchItemRecord[] = [
			{
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				restaurantName: "Restaurant A",
				ownerName: "Alice",
				ownerEmail: "alice@example.com",
				email: "a@example.com",
				phone: "+1111111111",
				status: "ACTIVE",
				onboardingStatus: "COMPLETED",
				isBlocked: false,
				blockReason: null,
				isSubscriptionActive: true,
				subscriptionPlanCode: "PRO",
				subscriptionEndsAt: null,
			},
		];

		const dtoList =
			GetBatchRestaurantsMapper.toRestaurantBatchItemDTOList(records);
		expect(dtoList).toHaveLength(1);
		expect(dtoList[0].id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(dtoList[0].restaurantId).toBe(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);
	});

	it("should return empty array if records is null or undefined", () => {
		expect(
			GetBatchRestaurantsMapper.toRestaurantBatchItemDTOList(
				null as unknown as RestaurantBatchItemRecord[],
			),
		).toEqual([]);
		expect(
			GetBatchRestaurantsMapper.toRestaurantBatchItemDTOList(
				undefined as unknown as RestaurantBatchItemRecord[],
			),
		).toEqual([]);
	});
});
