import { randomInt } from "node:crypto";

export const generateOtp = (): string => {
	return randomInt(100000, 1000000).toString();
};

export const getRestaurantEmailOtpKey = (
  email: string,
): string => {
  return `restaurant:email-verification:${email}`;
};

export const getRestaurantEmailOtpCooldownKey = (
	email: string,
): string => {
	return `restaurant:email-verification:cooldown:${email}`;
};

export const getRestaurantEmailOtpAttemptsKey = (
	email: string,
): string => {
	return `restaurant:email-verification:attempts:${email}`;
};
