import { Router } from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { LoginStaffController } from "@/presentation/controllers/staff/login-staff.controller.ts";
import type { LogoutStaffController } from "@/presentation/controllers/staff/logout-staff.controller.ts";
import { validateRequestBody } from "@/presentation/middleware/validation.middleware.ts";
import { loginStaffSchema } from "@/presentation/validators/staff/login-staff.validator.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";

const staffRouter = Router();

const loginStaffController = container.get<LoginStaffController>(
	TYPES.LoginStaffController,
);

const logoutStaffController = container.get<LogoutStaffController>(
	TYPES.LogoutStaffController,
);

staffRouter.post(
	STAFF_ROUTES.LOGIN,
	validateRequestBody(loginStaffSchema),
	loginStaffController.handle,
);

staffRouter.post(STAFF_ROUTES.LOGOUT, logoutStaffController.handle);

export default staffRouter;
