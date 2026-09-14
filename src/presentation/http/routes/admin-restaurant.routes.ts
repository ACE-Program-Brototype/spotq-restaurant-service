import { Router } from "express";
import { adminRestaurantController } from "@/config/di/controllers.resolutions";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware";
import {
	approveRestaurantRateLimiter,
	rejectRestaurantRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware";
import { approveRestaurantParamSchema } from "@/presentation/http/validators/admin/approve-restaurant.validator";
import { getRestaurantApplicationDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-application-details.validator";
import { listRestaurantApplicationsSchema } from "@/presentation/http/validators/admin/list-restaurant-applications.validator";
import {
	rejectRestaurantBodySchema,
	rejectRestaurantParamSchema,
} from "@/presentation/http/validators/admin/reject-restaurant.validator";
import { ADMIN_ROUTES } from "@/shared/constants/route.constants";

export const adminRestaurantRouter = Router();

adminRestaurantRouter.get(
	ADMIN_ROUTES.APPLICATIONS,
	adminAuthMiddleware,
	validateRequestQuery(listRestaurantApplicationsSchema),
	adminRestaurantController.listRestaurantApplications.bind(
		adminRestaurantController,
	),
);

adminRestaurantRouter.get(
	ADMIN_ROUTES.APPLICATION_DETAILS,
	adminAuthMiddleware,
	validateRequestParams(getRestaurantApplicationDetailsParamSchema),
	adminRestaurantController.getRestaurantApplicationDetails.bind(
		adminRestaurantController,
	),
);

adminRestaurantRouter.patch(
	ADMIN_ROUTES.APPROVE_RESTAURANT,
	adminAuthMiddleware,
	approveRestaurantRateLimiter,
	validateRequestParams(approveRestaurantParamSchema),
	adminRestaurantController.approveRestaurant.bind(adminRestaurantController),
);

adminRestaurantRouter.patch(
	ADMIN_ROUTES.REJECT_RESTAURANT,
	adminAuthMiddleware,
	rejectRestaurantRateLimiter,
	validateRequestParams(rejectRestaurantParamSchema),
	validateRequestBody(rejectRestaurantBodySchema),
	adminRestaurantController.rejectRestaurant.bind(adminRestaurantController),
);

export default adminRestaurantRouter;

