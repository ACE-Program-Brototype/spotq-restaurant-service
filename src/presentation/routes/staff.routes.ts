import { Router } from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { LoginStaffController } from "@/presentation/controllers/staff/login-staff.controller.ts";
import { validateRequestBody } from "@/presentation/middleware/validation.middleware.ts";
import { loginStaffSchema } from "@/presentation/validators/staff/login-staff.validator.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";

const staffRouter = Router();

const loginStaffController = container.get<LoginStaffController>(
	TYPES.LoginStaffController,
);

staffRouter.post(
	STAFF_ROUTES.LOGIN,
	validateRequestBody(loginStaffSchema),
	loginStaffController.handle,
);

export default staffRouter;
