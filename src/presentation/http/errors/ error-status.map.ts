import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { RestaurantAlreadyExistsError } from "@/application/errors/restaurant-already-exists.error";
import { InvalidVerificationTokenError } from "@/application/errors/invalid-verification-token.error";
import { OtpCooldownActiveError } from "@/application/errors/otp-cooldown-active.error";
import { OtpVerificationAttemptsExceededError } from "@/application/errors/otp-verification-attempts-exceeded.error";
import { RestaurantAccountBlockedError } from "@/application/errors/restaurant-account-blocked.error";

export const errorStatusMap = new Map<Function, number>([
	[RestaurantAlreadyExistsError, HTTP_STATUS.CONFLICT],
	[InvalidVerificationTokenError, HTTP_STATUS.UNAUTHORIZED],
	[OtpCooldownActiveError, HTTP_STATUS.TOO_MANY_REQUESTS],
	[OtpVerificationAttemptsExceededError, HTTP_STATUS.TOO_MANY_REQUESTS],
	[RestaurantAccountBlockedError, HTTP_STATUS.FORBIDDEN],
]);