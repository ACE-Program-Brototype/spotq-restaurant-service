import type { JwksController } from "@/presentation/http/controllers/jwks.controller";
import type { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import type { RestaurantStaffManagementController } from "@/presentation/http/controllers/restaurant.staff.management.controller";
import type { StaffController } from "@/presentation/http/controllers/staff.controller";
import type { StorageController } from "@/presentation/http/controllers/storage.controller";
import { container } from "./container";
import { TYPES } from "./types";

export const restaurantAuthController = container.get<RestaurantAuthController>(
	TYPES.Controller.RestaurantAuthController,
);

export const storageController = container.get<StorageController>(
	TYPES.Controller.StorageController,
);

export const staffController = container.get<StaffController>(
	TYPES.StaffController,
);

export const restaurantStaffManagementController =
	container.get<RestaurantStaffManagementController>(
		TYPES.RestaurantStaffManagementController,
	);

export const jwksController = container.get<JwksController>(
	TYPES.JWKSController,
);

