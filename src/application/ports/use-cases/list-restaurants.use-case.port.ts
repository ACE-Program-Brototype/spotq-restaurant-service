import type {
	ListRestaurantsDTO,
	PaginatedRestaurantsResponseDTO,
} from "@/application/dtos/admin/list-restaurants.dto.ts";

export interface IListRestaurantsUseCase {
	execute(dto: ListRestaurantsDTO): Promise<PaginatedRestaurantsResponseDTO>;
}
