export const QUEUE_NAMES = {
	EMAIL: "email-queue",
} as const;

export const JOB_NAMES = {
	EMAIL: {
		VERIFICATION_OTP: "verification-otp",
		TRANSACTIONAL: "send-email",
	},
} as const;

export const QUEUE_CONFIG = {
	BACKOFF_TYPE: "exponential" as const,
	REMOVE_ON_COMPLETE: true,
} as const;


