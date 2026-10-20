import { ContainerModule } from "inversify";
import type { IGetInternalMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-internal-menu-item-details.use-case.port.ts";
import type { IValidateRestaurantEligibilityUseCase } from "@/application/ports/use-cases/validate-restaurant-eligibility.use-case.port.ts";
import { GetInternalMenuItemDetailsUseCase } from "@/application/use-cases/internal/get-internal-menu-item-details.use-case.ts";
import { ValidateRestaurantEligibilityUseCase } from "@/application/use-cases/internal/validate-restaurant-eligibility.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { InternalRestaurantController } from "@/presentation/http/controllers/internal-restaurant.controller.ts";

export const internalModule = new ContainerModule(({ bind }) => {
	bind<IValidateRestaurantEligibilityUseCase>(
		TYPES.UseCases.ValidateRestaurantEligibilityUseCase,
	)
		.to(ValidateRestaurantEligibilityUseCase)
		.inSingletonScope();

	bind<IGetInternalMenuItemDetailsUseCase>(
		TYPES.UseCases.GetInternalMenuItemDetailsUseCase,
	)
		.to(GetInternalMenuItemDetailsUseCase)
		.inSingletonScope();

	bind<InternalRestaurantController>(
		TYPES.Controller.InternalRestaurantController,
	)
		.to(InternalRestaurantController)
		.inSingletonScope();
});
