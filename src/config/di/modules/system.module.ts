import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import {
	HealthCheckService,
	type IHealthCheckable,
} from "@/infrastructure/health/health-check.service.ts";

export const systemModule = new ContainerModule((bind) => {
	bind<IHealthCheckable>(TYPES.HealthCheckService)
		.to(HealthCheckService)
		.inSingletonScope();
});
