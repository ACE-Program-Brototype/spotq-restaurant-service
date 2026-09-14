import type {
	RejectRestaurantDto,
	RejectRestaurantResponseDto,
} from "@/application/dtos/admin/reject-restaurant.dto.ts";

export interface IRejectRestaurantUseCase {
	execute(dto: RejectRestaurantDto): Promise<RejectRestaurantResponseDto>;
}
