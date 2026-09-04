import { JwksController } from "@presentation/http/controllers/jwks.controller";
import { StaffController } from "@presentation/http/controllers/staff.controller";
import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";

export const presentationModule = new ContainerModule(({ bind }) => {
	bind<StaffController>(TYPES.StaffController)
		.to(StaffController)
		.inSingletonScope();

	bind<JwksController>(TYPES.JWKSController)
		.to(JwksController)
		.inSingletonScope();
});
