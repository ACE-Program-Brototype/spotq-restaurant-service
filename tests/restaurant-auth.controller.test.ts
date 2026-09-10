import assert from "node:assert/strict";
import { test } from "@jest/globals";
import type { Request, Response } from "express";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { messages } from "@/shared/constants/message.constants";

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

test("onboard rejects missing restaurant identification with 401", async () => {
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
	} as unknown as Request;

	const jsonMock = jest.fn();
	const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
	const res = {
		status: statusMock,
	} as unknown as Response;

	await controller.onboard(req, res);

	expect(statusMock).toHaveBeenCalledWith(401);
	expect(jsonMock).toHaveBeenCalledWith({
		success: false,
		message: messages.UNAUTHORIZED_RESTAURANT,
	});
});

test("onboard executes use case and returns 201 with restaurantId", async () => {
	const mockExecute = jest.fn().mockResolvedValue(undefined);

	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{ execute: mockExecute } as never,
	);

	const req = {
		headers: { "x-restaurant-id": "rest-123" },
		body: {
			restaurantName: "The Grill",
			phone: "9876543210",
			ownerName: "John",
		},
	} as unknown as Request;

	const res = {
		cookie: jest.fn(),
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockImplementation((data) => data),
	} as unknown as Response;

	await controller.onboard(req, res);

	expect(mockExecute).toHaveBeenCalledWith(
		{ restaurantName: "The Grill", phone: "9876543210", ownerName: "John" },
		"rest-123",
	);
});
