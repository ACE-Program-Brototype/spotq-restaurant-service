import { Router } from "express";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import type { StaffController } from "@/presentation/http/controllers/staff.controller";
import {
	forgotPasswordRateLimiter,
	loginRateLimiter,
	refreshTokenRateLimiter,
	resendOtpRateLimiter,
	resetPasswordRateLimiter,
	verifyOtpRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware";
import { validateRequestBody } from "@/presentation/http/middleware/validation.middleware";
import { forgotPasswordSchema } from "@/presentation/http/validators/staff/forgot-password.validator";
import { loginStaffSchema } from "@/presentation/http/validators/staff/login-staff.validator";
import { resendForgotPasswordOtpSchema } from "@/presentation/http/validators/staff/resend-forgot-password-otp.validator";
import { resetPasswordSchema } from "@/presentation/http/validators/staff/reset-password.validator";
import { verifyForgotPasswordOtpSchema } from "@/presentation/http/validators/staff/verify-forgot-password-otp.validator";
import { STAFF_ROUTES } from "@/shared/constants/route.constants";

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
