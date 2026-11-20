import type {
	SelectRestaurantDTO,
	SelectRestaurantResponseDTO,
} from "@/application/dtos/staff/select-restaurant.dto.ts";

export interface ISelectRestaurantUseCase {
	execute(dto: SelectRestaurantDTO): Promise<SelectRestaurantResponseDTO>;
}
