import { inject, injectable, optional } from "inversify";
import type { GetStaffDetailDTO } from "@/application/dtos/staff/get-staff-detail.dto.ts";
import type { StaffDetailResponseDTO } from "@/application/dtos/staff/staff-detail-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import type { IGetStaffDetailUseCase } from "@/application/ports/use-cases/get-staff-detail.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetStaffDetailUseCase implements IGetStaffDetailUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	public async execute(
		dto: GetStaffDetailDTO,
	): Promise<StaffDetailResponseDTO> {
		const restaurantId = dto.restaurantId?.trim();
		const staffId = dto.staffId?.trim();

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const staff = await this.staffRepository.findByIdAndRestaurantId(
			staffId,
			restaurantId,
		);

		if (staff?.role !== "STAFF") {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		let avatarUrl: string | null = staff.avatarUrl;
		if (this.storageService) {
			const s3Key =
				staff.avatarUrl ||
				(staff.avatarUpdatedAt
					? `restaurants/${staff.restaurantId}/staff/${staff.id}/avatar.png`
					: null);
			if (s3Key) {
				try {
					const { downloadUrl } =
						await this.storageService.generatePresignedGetUrl({
							key: s3Key,
						});
					avatarUrl = downloadUrl;
				} catch {
					avatarUrl = s3Key;
				}
			}
		}

		return StaffMapper.toDetailDTO(staff, avatarUrl);
	}
}
