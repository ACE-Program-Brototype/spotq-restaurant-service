import { inject, injectable } from "inversify";
import type { UpdateStaffProfileDTO } from "@/application/dtos/staff/update-staff-profile.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
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
	) {}

	public async execute(
		dto: UpdateStaffProfileDTO,
	): Promise<UpdateStaffProfileResponseDTO> {
		const { restaurantId, staffId } = dto;

		const finalName = dto.name ?? dto.fullname;
		const finalPhone = dto.phone;
		const finalAvatarUrl =
			dto.avatar_url !== undefined ? dto.avatar_url : dto.avatarUrl;

		if (
			finalName === undefined &&
			finalPhone === undefined &&
			finalAvatarUrl === undefined
		) {
			throw new InvalidStaffDataError(messages.AT_LEAST_ONE_FIELD_REQUIRED);
		}

		if (finalAvatarUrl) {
			if (
				finalAvatarUrl.includes("..") ||
				finalAvatarUrl.startsWith("/") ||
				finalAvatarUrl.startsWith("\\")
			) {
				throw new InvalidStaffDataError(messages.INVALID_AVATAR_KEY);
			}

			const segments = finalAvatarUrl.split(/[\\/]/);
			const restaurantIndex = segments.indexOf("restaurants");
			if (
				restaurantIndex !== -1 &&
				segments[restaurantIndex + 1] &&
				segments[restaurantIndex + 1] !== restaurantId
			) {
				throw new StaffForbiddenError(messages.AVATAR_RESTAURANT_MISMATCH);
			}

			if (segments[0] === "staff" && segments[1] && segments[1] !== staffId) {
				throw new StaffForbiddenError(messages.AVATAR_STAFF_MISMATCH);
			}
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

		staff.updateProfile(finalName, finalPhone, finalAvatarUrl);

		await this.staffRepository.save(staff);

		return StaffMapper.toUpdateProfileDTO(staff);
	}
}
