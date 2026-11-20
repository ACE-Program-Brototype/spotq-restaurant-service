import type {
	ListRestaurantApplicationsDto,
	PaginatedRestaurantApplicationsResponseDto,
} from "@/application/dtos/admin/list-restaurant-applications.dto.ts";

export interface IListRestaurantApplicationsUseCase {
	execute(
		dto: ListRestaurantApplicationsDto,
	): Promise<PaginatedRestaurantApplicationsResponseDto>;
}
