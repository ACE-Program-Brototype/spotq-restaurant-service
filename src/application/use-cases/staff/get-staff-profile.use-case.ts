import { inject, injectable, optional } from "inversify";
import type { GetStaffProfileDTO } from "@/application/dtos/staff/get-staff-profile.dto.ts";
import type { StaffProfileResponseDTO } from "@/application/dtos/staff/staff-profile-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import type { IGetStaffProfileUseCase } from "@/application/ports/use-cases/get-staff-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetStaffProfileUseCase implements IGetStaffProfileUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	public async execute(
		dto: GetStaffProfileDTO,
	): Promise<StaffProfileResponseDTO> {
		if (!dto.staffId) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		let staff: RestaurantStaff | null = null;
		if (
			dto.restaurantId &&
			this.staffRepository.findByStaffIdAndRestaurantId
		) {
			staff = await this.staffRepository.findByStaffIdAndRestaurantId(
				dto.staffId,
				dto.restaurantId,
			);
		}

		if (!staff) {
			staff = await this.staffRepository.findById(dto.staffId);
		}

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		if (staff?.status === "INACTIVE") {
			throw new StaffInactiveError();
		}

		if (staff?.status === "SUSPENDED") {
			throw new StaffSuspendedError();
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

		return StaffMapper.toProfileDTO(staff, avatarUrl);
	}
}
