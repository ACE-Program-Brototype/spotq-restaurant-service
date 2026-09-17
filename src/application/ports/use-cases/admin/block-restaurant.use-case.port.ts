import type {
	BlockRestaurantDto,
	BlockRestaurantResponseDto,
} from "@/application/dtos/admin/block-restaurant.dto.ts";

export interface IBlockRestaurantUseCase {
	execute(dto: BlockRestaurantDto): Promise<BlockRestaurantResponseDto>;
}
