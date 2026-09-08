import { inject, injectable } from "inversify";
import type { GetStaffProfileDTO } from "@/application/dtos/staff/get-staff-profile.dto.ts";
import type { StaffProfileResponseDTO } from "@/application/dtos/staff/staff-profile-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IGetStaffProfileUseCase } from "@/application/ports/use-cases/get-staff-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { StaffNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetStaffProfileUseCase implements IGetStaffProfileUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
	) {}

	public async execute(
		dto: GetStaffProfileDTO,
	): Promise<StaffProfileResponseDTO> {
		if (!dto.staffId) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		const staff = await this.staffRepository.findById(dto.staffId);
		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		return StaffMapper.toProfileDTO(staff);
	}
}
