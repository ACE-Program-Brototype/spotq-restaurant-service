import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type { LoginStaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export type ILoginStaffUseCase = IUseCase<LoginStaffDTO, LoginStaffResponseDTO>;
