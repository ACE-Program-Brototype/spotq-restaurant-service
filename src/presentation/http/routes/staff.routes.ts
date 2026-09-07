import { Router } from "express";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import type { StaffController } from "@/presentation/http/controllers/staff.controller";
import {
	acceptInvitationRateLimiter,
	forgotPasswordRateLimiter,
	inviteStaffRateLimiter,
	loginRateLimiter,
	refreshTokenRateLimiter,
	resendOtpRateLimiter,
	resetPasswordRateLimiter,
	validateInvitationRateLimiter,
	verifyOtpRateLimiter,
} from "@/presentation/http/middleware/rate-limiter.middleware";
import { validateRequestBody } from "@/presentation/http/middleware/validation.middleware";
import { acceptInvitationSchema } from "@/presentation/http/validators/staff/accept-invitation.validator";
import { forgotPasswordSchema } from "@/presentation/http/validators/staff/forgot-password.validator";
import { inviteStaffSchema } from "@/presentation/http/validators/staff/invite-staff.validator";
import { loginStaffSchema } from "@/presentation/http/validators/staff/login-staff.validator";
import { resendForgotPasswordOtpSchema } from "@/presentation/http/validators/staff/resend-forgot-password-otp.validator";
import { resendInvitationSchema } from "@/presentation/http/validators/staff/resend-invitation.validator";
import { resetPasswordSchema } from "@/presentation/http/validators/staff/reset-password.validator";
import { revokeInvitationSchema } from "@/presentation/http/validators/staff/revoke-invitation.validator";
import { validateInvitationSchema } from "@/presentation/http/validators/staff/validate-invitation.validator";
import { verifyForgotPasswordOtpSchema } from "@/presentation/http/validators/staff/verify-forgot-password-otp.validator";
import { STAFF_ROUTES } from "@/shared/constants/route.constants";

const staffRouter = Router();

const staffController = container.get<StaffController>(TYPES.StaffController);

staffRouter.post(
	STAFF_ROUTES.INVITATIONS,
	inviteStaffRateLimiter,
	validateRequestBody(inviteStaffSchema),
	staffController.inviteStaff,
);

staffRouter.post(
	STAFF_ROUTES.VALIDATE_INVITATION,
	validateInvitationRateLimiter,
	validateRequestBody(validateInvitationSchema),
	staffController.validateInvitation,
);

staffRouter.post(
	STAFF_ROUTES.ACCEPT_INVITATION,
	acceptInvitationRateLimiter,
	validateRequestBody(acceptInvitationSchema),
	staffController.acceptInvitation,
);

staffRouter.post(
	STAFF_ROUTES.RESEND_INVITATION,
	inviteStaffRateLimiter,
	validateRequestBody(resendInvitationSchema),
	staffController.resendInvitation,
);

staffRouter.post(
	STAFF_ROUTES.REVOKE_INVITATION,
	validateRequestBody(revokeInvitationSchema),
	staffController.revokeInvitation,
);

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
