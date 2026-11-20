import type { GetStaffProfileDTO } from "@/application/dtos/staff/get-staff-profile.dto.ts";
import type { StaffProfileResponseDTO } from "@/application/dtos/staff/staff-profile-response.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export type IGetStaffProfileUseCase = IUseCase<
	GetStaffProfileDTO,
	StaffProfileResponseDTO
>;
