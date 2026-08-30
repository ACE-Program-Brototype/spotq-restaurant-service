import { Router } from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import type { StaffController } from "@/presentation/controllers/staff.controller.ts";
import {
	forgotPasswordRateLimiter,
	loginRateLimiter,
	refreshTokenRateLimiter,
	resendOtpRateLimiter,
	resetPasswordRateLimiter,
	verifyOtpRateLimiter,
} from "@/presentation/middleware/rate-limiter.middleware.ts";
import { validateRequestBody } from "@/presentation/middleware/validation.middleware.ts";
import { forgotPasswordSchema } from "@/presentation/validators/staff/forgot-password.validator.ts";
import { loginStaffSchema } from "@/presentation/validators/staff/login-staff.validator.ts";
import { resendForgotPasswordOtpSchema } from "@/presentation/validators/staff/resend-forgot-password-otp.validator.ts";
import { resetPasswordSchema } from "@/presentation/validators/staff/reset-password.validator.ts";
import { verifyForgotPasswordOtpSchema } from "@/presentation/validators/staff/verify-forgot-password-otp.validator.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";

const staffRouter = Router();

const staffController = container.get<StaffController>(TYPES.StaffController);

staffRouter.post(
	STAFF_ROUTES.LOGIN,
	loginRateLimiter,
	validateRequestBody(loginStaffSchema),
	staffController.login,
);

staffRouter.post(STAFF_ROUTES.LOGOUT, staffController.logout);

staffRouter.post(
	STAFF_ROUTES.REFRESH_TOKEN,
	refreshTokenRateLimiter,
	staffController.refreshToken,
);

staffRouter.post(
	STAFF_ROUTES.FORGOT_PASSWORD,
	forgotPasswordRateLimiter,
	validateRequestBody(forgotPasswordSchema),
	staffController.forgotPassword,
);

staffRouter.post(
	STAFF_ROUTES.VERIFY_FORGOT_PASSWORD_OTP,
	verifyOtpRateLimiter,
	validateRequestBody(verifyForgotPasswordOtpSchema),
	staffController.verifyForgotPasswordOtp,
);

staffRouter.post(
	STAFF_ROUTES.RESEND_FORGOT_PASSWORD_OTP,
	resendOtpRateLimiter,
	validateRequestBody(resendForgotPasswordOtpSchema),
	staffController.resendForgotPasswordOtp,
);

staffRouter.post(
	STAFF_ROUTES.RESET_PASSWORD,
	resetPasswordRateLimiter,
	validateRequestBody(resetPasswordSchema),
	staffController.resetPassword,
);

export default staffRouter;
