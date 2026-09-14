import { ContainerModule } from "inversify";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import { ApproveRestaurantUseCase } from "@/application/use-cases/admin/approve-restaurant.use-case.ts";
import { GetRestaurantApplicationDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-application-details.use-case.ts";
import { ListRestaurantApplicationsUseCase } from "@/application/use-cases/admin/list-restaurant-applications.use-case.ts";
import { RejectRestaurantUseCase } from "@/application/use-cases/admin/reject-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";

export const adminModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.AdminRestaurantController)
		.to(AdminRestaurantController)
		.inSingletonScope();

	// Use Cases
	bind<IApproveRestaurantUseCase>(TYPES.ApproveRestaurantUseCase)
		.to(ApproveRestaurantUseCase)
		.inSingletonScope();

	bind<IRejectRestaurantUseCase>(TYPES.RejectRestaurantUseCase)
		.to(RejectRestaurantUseCase)
		.inSingletonScope();

	bind<IListRestaurantApplicationsUseCase>(
		TYPES.ListRestaurantApplicationsUseCase,
	)
		.to(ListRestaurantApplicationsUseCase)
		.inSingletonScope();

	bind<IGetRestaurantApplicationDetailsUseCase>(
		TYPES.GetRestaurantApplicationDetailsUseCase,
	)
		.to(GetRestaurantApplicationDetailsUseCase)
		.inSingletonScope();
});

