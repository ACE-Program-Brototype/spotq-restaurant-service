import { inject, injectable } from "inversify";
import type { UpdateStaffProfileDTO } from "@/application/dtos/staff/update-staff-profile.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IUpdateStaffProfileUseCase } from "@/application/ports/use-cases/update-staff-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidStaffDataError,
	StaffNotFoundError,
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

		let avatarUrl: string | null | undefined;
		if (dto.avatarUrl !== undefined) {
			avatarUrl = dto.avatarUrl;
		} else if (dto.avatar_url !== undefined) {
			avatarUrl = dto.avatar_url;
		} else if (dto.hasAvatar === false) {
			avatarUrl = null;
		}

		if (
			finalName === undefined &&
			finalPhone === undefined &&
			avatarUrl === undefined &&
			dto.avatarUpdatedAt === undefined &&
			dto.hasAvatar === undefined
		) {
			throw new InvalidStaffDataError(messages.AT_LEAST_ONE_FIELD_REQUIRED);
		}

		let staff = this.staffRepository.findByStaffIdAndRestaurantId
			? await this.staffRepository.findByStaffIdAndRestaurantId(
					staffId,
					restaurantId,
				)
			: null;

		if (!staff) {
			staff = await this.staffRepository.findById(staffId);
		}

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		let avatarToSet: string | Date | null | undefined = avatarUrl;
		if (dto.hasAvatar === true && avatarUrl === undefined) {
			avatarToSet = new Date();
		} else if (dto.hasAvatar === false) {
			avatarToSet = null;
		}

		staff.updateProfile(finalName, finalPhone, avatarToSet);
		await this.staffRepository.save(staff);

		return StaffMapper.toUpdateProfileDTO(staff, staff.avatarUrl);
	}
}
