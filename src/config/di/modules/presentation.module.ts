import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { StaffController } from "@presentation/http/controllers/staff.controller";

export const presentationModule = new ContainerModule(({ bind }) => {
	bind<StaffController>(TYPES.StaffController)
		.to(StaffController)
		.inSingletonScope();
});
