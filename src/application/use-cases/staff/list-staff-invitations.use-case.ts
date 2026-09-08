import { inject, injectable } from "inversify";
import type {
	ListStaffInvitationsDTO,
	PaginatedStaffInvitationsResponseDTO,
} from "@/application/dtos/staff/list-invitations.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListStaffInvitationsUseCase } from "@/application/ports/use-cases/list-staff-invitations.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

@injectable()
export class ListStaffInvitationsUseCase
	implements IListStaffInvitationsUseCase
{
	constructor(
		@inject(TYPES.StaffInvitationRepository)
		private readonly staffInvitationRepository: IStaffInvitationRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: ListStaffInvitationsDTO,
	): Promise<PaginatedStaffInvitationsResponseDTO> {
		const restaurantId = dto.restaurantId.trim();

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const page = dto.page && dto.page > 0 ? dto.page : DEFAULT_PAGE;
		const limit = dto.limit && dto.limit > 0 ? dto.limit : DEFAULT_LIMIT;
		const sortBy = dto.sortBy || DEFAULT_SORT_BY;
		const sortOrder = dto.sortOrder || DEFAULT_SORT_ORDER;

		const { invitations, total } =
			await this.staffInvitationRepository.findManyWithFilters({
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
			invitations: invitations.map((inv) => ({
				id: inv.id,
				restaurantId: inv.restaurantId,
				email: inv.email,
				status: inv.status,
				expiresAt: inv.expiresAt,
				acceptedAt: inv.acceptedAt,
				createdAt: inv.createdAt,
				updatedAt: inv.updatedAt,
			})),
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
