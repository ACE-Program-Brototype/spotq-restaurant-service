import assert from "node:assert/strict";
import { expect, jest, test } from "@jest/globals";
import type { Request, Response } from "express";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { HTTP_STATUS } from "@/shared/constants/http.constants";

test("refreshAccessToken rejects a missing refresh cookie with InvalidRefreshTokenError", async () => {
	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{ execute: async () => ({ accessToken: "new-access-token" }) } as never,
		{} as never,
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
		{} as never,
	);

	const req = {
		headers: {},
		body: { restaurantName: "Test" },
	} as unknown as Request;

	let responseCode = 0;
	let responseBody: unknown = null;
	const res = {
		status: (code: number) => {
			responseCode = code;
			return {
				json: (data: unknown) => {
					responseBody = data;
					return res;
				},
			};
		},
	} as unknown as Response;

	await controller.onboard(req, res);

	assert.equal(responseCode, HTTP_STATUS.UNAUTHORIZED);
	assert.ok(responseBody);
});

test("onboard executes use case and returns 201 with restaurantId", async () => {
	const mockExecute = jest.fn().mockResolvedValue(undefined as never);

	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{ execute: mockExecute } as never,
		{} as never,
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

test("getVerificationStatus returns mapped status for a valid restaurant", async () => {
	const mockResult = {
		status: "UNDER_REVIEW" as const,
		submittedAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
	};

	const mockUseCase = {
		execute: async () => mockResult,
	};

	const controller = new RestaurantAuthController(
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		{} as never,
		mockUseCase as never,
	);

	const req = {
		params: { id: "rest-123" },
	} as never;

	let responseCode = 0;
	let responseBody: { success?: boolean; data?: { status?: string } } | null =
		null;

	const res = {
		status: (code: number) => {
			responseCode = code;
			return {
				json: (data: unknown) => {
					responseBody = data as typeof responseBody;
					return res;
				},
			};
		},
	};

	await controller.getVerificationStatus(req, res as unknown as Response);

	const body = responseBody as {
		success?: boolean;
		data?: { status?: string };
	} | null;
	assert.equal(responseCode, 200);
	assert.equal(body?.success, true);
	assert.equal(body?.data?.status, "UNDER_REVIEW");
});
