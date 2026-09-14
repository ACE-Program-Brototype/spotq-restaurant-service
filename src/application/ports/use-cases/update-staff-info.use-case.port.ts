import type {
	UpdateStaffInfoDTO,
	UpdateStaffInfoResponseDTO,
} from "@/application/dtos/staff/update-staff-info.dto.ts";

export interface IUpdateStaffInfoUseCase {
	execute(dto: UpdateStaffInfoDTO): Promise<UpdateStaffInfoResponseDTO>;
}
