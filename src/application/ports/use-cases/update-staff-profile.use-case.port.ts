import type { UpdateStaffProfileDTO } from "@/application/dtos/staff/update-staff-profile.dto.ts";
import type { UpdateStaffProfileResponseDTO } from "@/application/dtos/staff/update-staff-profile-response.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export type IUpdateStaffProfileUseCase = IUseCase<
	UpdateStaffProfileDTO,
	UpdateStaffProfileResponseDTO
>;
