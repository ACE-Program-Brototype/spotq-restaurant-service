import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { StaffController } from "@/presentation/controllers/staff.controller.ts";

export const presentationModule = new ContainerModule((bind) => {
	bind<StaffController>(TYPES.StaffController)
		.to(StaffController)
		.inSingletonScope();
});
