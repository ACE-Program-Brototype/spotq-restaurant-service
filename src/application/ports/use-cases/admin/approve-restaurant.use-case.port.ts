import type {
	ApproveRestaurantDto,
	ApproveRestaurantResponseDto,
} from "@/application/dtos/admin/approve-restaurant.dto.ts";

export interface IApproveRestaurantUseCase {
	execute(dto: ApproveRestaurantDto): Promise<ApproveRestaurantResponseDto>;
}
