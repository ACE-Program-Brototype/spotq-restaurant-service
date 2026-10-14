import { Router } from "express";
import { addonController } from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { restaurantOrStaffAuthMiddleware } from "../middleware/restaurant-or-staff.auth.middleware";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
} from "../middleware/validation.middleware";
import {
	createAddonBodySchema,
	createAddonParamsSchema,
	listAddonsParamsSchema,
} from "../validators/create-addon.validator";
import { deleteAddonParamsSchema } from "../validators/delete-addon.validator";
import {
	updateAddonBodySchema,
	updateAddonParamsSchema,
} from "../validators/update-addon.validator";

export const addonRouter = Router();

addonRouter.post(
	RESTAURANT_ROUTES.RESTAURANT_ADDONS,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createAddonParamsSchema),
	validateRequestBody(createAddonBodySchema),
	addonController.createAddon,
);

addonRouter.get(
	RESTAURANT_ROUTES.RESTAURANT_ADDONS,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(listAddonsParamsSchema),
	addonController.listAddons,
);

addonRouter.patch(
	RESTAURANT_ROUTES.RESTAURANT_ADDON_UPDATE,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(updateAddonParamsSchema),
	validateRequestBody(updateAddonBodySchema),
	addonController.updateAddon,
);

addonRouter.delete(
	RESTAURANT_ROUTES.RESTAURANT_ADDON_DELETE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(deleteAddonParamsSchema),
	addonController.deleteAddon,
);
