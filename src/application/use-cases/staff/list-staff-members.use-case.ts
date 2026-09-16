import { inject, injectable } from "inversify";
import type {
	ListStaffMembersDTO,
	PaginatedStaffMembersResponseDTO,
} from "@/application/dtos/staff/list-staff.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListStaffMembersUseCase } from "@/application/ports/use-cases/list-staff-members.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { RestaurantNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

const DEFAULT_PAGE = 1;

@injectable()
export class ListStaffMembersUseCase implements IListStaffMembersUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: ListStaffMembersDTO,
	): Promise<PaginatedStaffMembersResponseDTO> {
		const restaurantId = dto.restaurantId.trim();

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}


		const page = dto.page && dto.page > 0 ? dto.page : DEFAULT_PAGE;
		const limit =
			dto.limit && dto.limit > 0
				? Math.min(dto.limit, env.PAGINATION_MAX_LIMIT)
				: env.PAGINATION_DEFAULT_LIMIT;
		const sortBy = "createdAt";
		const sortOrder = (
			dto.sortOrder?.toLowerCase() === "asc" ? "asc" : "desc"
		) as "asc" | "desc";

		const { staff, total } = await this.staffRepository.findManyWithFilters({
			restaurantId,
			page,
			limit,
			status: dto.status,
			search: dto.search?.trim(),
			sortBy,
			sortOrder,
		});

		const totalPages = Math.ceil(total / limit);

		return {
			staff: staff.map((member) => StaffMapper.toItemDTO(member)),
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	}
}
