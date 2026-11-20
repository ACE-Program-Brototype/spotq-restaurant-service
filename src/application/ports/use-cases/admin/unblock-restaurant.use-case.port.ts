import type {
	UnblockRestaurantDto,
	UnblockRestaurantResponseDto,
} from "@/application/dtos/admin/unblock-restaurant.dto.ts";

export interface IUnblockRestaurantUseCase {
	execute(dto: UnblockRestaurantDto): Promise<UnblockRestaurantResponseDto>;
}
