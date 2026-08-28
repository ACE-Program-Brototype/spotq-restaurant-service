import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { LoginStaffController } from "@/presentation/controllers/staff/login-staff.controller.ts";

export const presentationModule = new ContainerModule((bind) => {
	bind<LoginStaffController>(TYPES.LoginStaffController)
		.to(LoginStaffController)
		.inSingletonScope();
});
