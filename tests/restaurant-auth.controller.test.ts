import assert from "node:assert/strict";
import { test } from "@jest/globals";
import type { Response } from "express";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { InvalidVerificationTokenError } from "@/application/errors/invalid-verification-token.error";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";

test("refreshAccessToken rejects a missing refresh cookie with InvalidRefreshTokenError", async () => {
	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{ execute: async () => ({ accessToken: "new-access-token" }) } as never,
		{} as never,
	);

	const req = {
		headers: {},
		body: {},
		query: {},
	} as never;

	const res = {
		cookie: () => {},
	} as never;

	await assert.rejects(
		() => controller.refreshAccessToken(req, res),
		InvalidRefreshTokenError,
	);
});

test("onboard rejects missing Bearer token in authorization header", async () => {
	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{ execute: jest.fn() } as never,
	);

	const req = {
		headers: {},
		body: { restaurantName: "Test" },
	} as never;

	const res = {
		cookie: jest.fn(),
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	} as unknown as Response;

	await assert.rejects(
		() => controller.onboard(req, res),
		InvalidVerificationTokenError,
	);
});

test("onboard executes use case, sets access/refresh cookies, and returns 201 with restaurant and token", async () => {
	const mockExecute = jest.fn().mockResolvedValue({
		restaurant: { id: "rest-123", restaurantName: "The Grill" },
		accessToken: "jwt-access-token-123",
		refreshToken: "jwt-refresh-token-123",
	});

	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{ execute: mockExecute } as never,
	);

	const req = {
		headers: { authorization: "Bearer verify-token-123" },
		body: { restaurantName: "The Grill", phone: "9876543210", ownerName: "John" },
	} as never;

	const cookieCalls: [string, string, unknown][] = [];
	const res = {
		cookie: (name: string, val: string, opts: unknown) => {
			cookieCalls.push([name, val, opts]);
		},
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockImplementation((data) => data),
	} as unknown as Response;

	await controller.onboard(req, res);

	expect(mockExecute).toHaveBeenCalledWith(
		{ restaurantName: "The Grill", phone: "9876543210", ownerName: "John" },
		"verify-token-123",
	);
	expect(cookieCalls.length).toBe(2);
	expect(cookieCalls[0][0]).toBe("accessToken");
	expect(cookieCalls[0][1]).toBe("jwt-access-token-123");
	expect(cookieCalls[1][0]).toBe("refreshToken");
	expect(cookieCalls[1][1]).toBe("jwt-refresh-token-123");
});
