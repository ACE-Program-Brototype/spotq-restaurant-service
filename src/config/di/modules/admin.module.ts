import { ContainerModule } from "inversify";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import { ApproveRestaurantUseCase } from "@/application/use-cases/admin/approve-restaurant.use-case.ts";
import { BlockRestaurantUseCase } from "@/application/use-cases/admin/block-restaurant.use-case.ts";
import { GetRestaurantApplicationDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-application-details.use-case.ts";
import { GetRestaurantDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-details.use-case.ts";
import { ListRestaurantApplicationsUseCase } from "@/application/use-cases/admin/list-restaurant-applications.use-case.ts";
import { RejectRestaurantUseCase } from "@/application/use-cases/admin/reject-restaurant.use-case.ts";
import { UnblockRestaurantUseCase } from "@/application/use-cases/admin/unblock-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";

export const adminModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.AdminRestaurantController)
		.to(AdminRestaurantController)
		.inSingletonScope();

	// Use Cases
	bind<IApproveRestaurantUseCase>(TYPES.UseCases.ApproveRestaurantUseCase)
		.to(ApproveRestaurantUseCase)
		.inSingletonScope();

	bind<IRejectRestaurantUseCase>(TYPES.UseCases.RejectRestaurantUseCase)
		.to(RejectRestaurantUseCase)
		.inSingletonScope();

	bind<IListRestaurantApplicationsUseCase>(
		TYPES.UseCases.ListRestaurantApplicationsUseCase,
	)
		.to(ListRestaurantApplicationsUseCase)
		.inSingletonScope();

	bind<IGetRestaurantApplicationDetailsUseCase>(
		TYPES.UseCases.GetRestaurantApplicationDetailsUseCase,
	)
		.to(GetRestaurantApplicationDetailsUseCase)
		.inSingletonScope();

	bind<IGetRestaurantDetailsUseCase>(TYPES.UseCases.GetRestaurantDetailsUseCase)
		.to(GetRestaurantDetailsUseCase)
		.inSingletonScope();

	bind<IBlockRestaurantUseCase>(TYPES.UseCases.BlockRestaurantUseCase)
		.to(BlockRestaurantUseCase)
		.inSingletonScope();

	bind<IUnblockRestaurantUseCase>(TYPES.UseCases.UnblockRestaurantUseCase)
		.to(UnblockRestaurantUseCase)
		.inSingletonScope();
});
