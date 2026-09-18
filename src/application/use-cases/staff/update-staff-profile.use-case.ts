import { inject, injectable, optional } from "inversify";
import type { UpdateStaffProfileDTO } from "@/application/dtos/staff/update-staff-profile.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import type { IUpdateStaffProfileUseCase } from "@/application/ports/use-cases/update-staff-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidStaffDataError,
	StaffForbiddenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateStaffProfileUseCase implements IUpdateStaffProfileUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	public async execute(
		dto: UpdateStaffProfileDTO,
	): Promise<UpdateStaffProfileResponseDTO> {
		const { restaurantId, staffId } = dto;

		const finalName = dto.name ?? dto.fullname;
		const finalPhone = dto.phone;

		let avatarUpdatedAt: Date | null | undefined;
		if (dto.avatarUpdatedAt !== undefined) {
			avatarUpdatedAt = dto.avatarUpdatedAt;
		} else if (dto.hasAvatar !== undefined) {
			avatarUpdatedAt = dto.hasAvatar ? new Date() : null;
		} else if (dto.avatar_url !== undefined || dto.avatarUrl !== undefined) {
			const rawAvatar =
				dto.avatar_url !== undefined ? dto.avatar_url : dto.avatarUrl;
			avatarUpdatedAt = rawAvatar ? new Date() : null;
		}

		if (
			finalName === undefined &&
			finalPhone === undefined &&
			avatarUpdatedAt === undefined
		) {
			throw new InvalidStaffDataError(messages.AT_LEAST_ONE_FIELD_REQUIRED);
		}

		const staff = await this.staffRepository.findById(staffId);

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		if (staff.status === "INACTIVE") {
			throw new StaffInactiveError();
		}

		if (staff.status === "SUSPENDED") {
			throw new StaffSuspendedError();
		}

		if (staff.restaurantId !== restaurantId) {
			throw new StaffForbiddenError(messages.STAFF_RESTAURANT_FORBIDDEN);
		}

		staff.updateProfile(finalName, finalPhone, avatarUpdatedAt);

		await this.staffRepository.save(staff);

		let avatarUrl: string | null = null;
		if (staff.avatarUpdatedAt && this.storageService) {
			try {
				const { downloadUrl } =
					await this.storageService.generatePresignedGetUrl({
						key: `restaurants/${staff.restaurantId}/staff/${staff.id}/avatar.png`,
					});
				avatarUrl = downloadUrl;
			} catch {
				avatarUrl = null;
			}
		}

		return StaffMapper.toUpdateProfileDTO(staff, avatarUrl);
	}
}
