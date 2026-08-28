import { ContainerModule } from "inversify";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import { LoginStaffUseCase } from "@/application/use-cases/staff/login-staff.use-case.ts";
import { TYPES } from "@/config/di/types.ts";

export const applicationModule = new ContainerModule((bind) => {
	bind<ILoginStaffUseCase>(TYPES.LoginStaffUseCase)
		.to(LoginStaffUseCase)
		.inSingletonScope();
});
