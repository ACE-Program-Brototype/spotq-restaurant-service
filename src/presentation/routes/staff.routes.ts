import { Router } from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { StaffController } from "@/presentation/controllers/staff.controller.ts";
import { validateRequestBody } from "@/presentation/middleware/validation.middleware.ts";
import { loginStaffSchema } from "@/presentation/validators/staff/login-staff.validator.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";

const staffRouter = Router();

const staffController = container.get<StaffController>(TYPES.StaffController);

staffRouter.post(
	STAFF_ROUTES.LOGIN,
	validateRequestBody(loginStaffSchema),
	staffController.login,
);

staffRouter.post(STAFF_ROUTES.LOGOUT, staffController.logout);

staffRouter.post(STAFF_ROUTES.REFRESH_TOKEN, staffController.refreshToken);

export default staffRouter;
