import type { GetStaffDetailDTO } from "@/application/dtos/staff/get-staff-detail.dto.ts";
import type { StaffDetailResponseDTO } from "@/application/dtos/staff/staff-detail-response.dto.ts";

export interface IGetStaffDetailUseCase {
	execute(dto: GetStaffDetailDTO): Promise<StaffDetailResponseDTO>;
}
