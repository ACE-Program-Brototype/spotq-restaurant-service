import type { RestaurantBatchItemDTO } from "@/application/dtos/internal/get-batch-restaurants.dto.ts";
import type { RestaurantBatchItemRecord } from "@/domain/repositories/restaurant.repository.interface.ts";

export const GetBatchRestaurantsMapper = {
	toDTO(record: RestaurantBatchItemRecord): RestaurantBatchItemDTO {
		return {
			id: record.id,
			restaurantName: record.restaurantName,
			ownerName: record.ownerName,
			ownerEmail: record.ownerEmail,
			email: record.email,
			phone: record.phone,
			status: record.status,
			onboardingStatus: record.onboardingStatus,
			isBlocked: record.isBlocked,
			blockReason: record.blockReason,
			isSubscriptionActive: record.isSubscriptionActive,
			subscriptionPlanCode: record.subscriptionPlanCode,
			subscriptionEndsAt: record.subscriptionEndsAt
				? record.subscriptionEndsAt.toISOString()
				: null,
		};
	},

	toDTOList(records: RestaurantBatchItemRecord[]): RestaurantBatchItemDTO[] {
		return records.map(GetBatchRestaurantsMapper.toDTO);
	},
};
