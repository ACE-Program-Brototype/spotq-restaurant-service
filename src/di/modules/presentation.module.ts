import { StaffController } from "@presentation/http/controllers/staff.controller";
import { ContainerModule } from "inversify";
import { TYPES } from "@/di/types.ts";

export const presentationModule = new ContainerModule(({ bind }) => {
	bind<StaffController>(TYPES.StaffController)
		.to(StaffController)
		.inSingletonScope();
});
