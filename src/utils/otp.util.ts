import { randomBytes, randomInt } from "node:crypto";

export const generateOtp = (): string => {
	return randomInt(100000, 1000000).toString();
};

export const generateVerificationToken = (): string => {
	return randomBytes(32).toString("hex");
};

export const getRestaurantEmailOtpKey = (email: string): string => {
	return `restaurant:email-verification:${email.trim().toLowerCase()}`;
};

export const getRestaurantEmailOtpSendKey = (email: string): string => {
	return `restaurant:email-verification:send-limit:${email.trim().toLowerCase()}`;
};

export const getRestaurantEmailOtpResendKey = (email: string): string => {
	return `restaurant:email-verification:resend-limit:${email.trim().toLowerCase()}`;
};

export const getRestaurantEmailOtpAttemptsKey = (email: string): string => {
	return `restaurant:email-verification:attempts:${email.trim().toLowerCase()}`;
};

export const getRestaurantEmailVerificationTokenKey = (
	token: string,
): string => {
	return `restaurant:email-verification:token:${token}`;
};
