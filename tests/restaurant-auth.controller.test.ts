import assert from "node:assert/strict";
import { test } from "@jest/globals";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";

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

	let responseBody: { success?: boolean; data?: { status?: string } } | null =
		null;

	const res = {
		status: (code: number) => {
			responseCode = code;
			return {
				json: (data: unknown) => {
					responseBody = data as {
						success?: boolean;
						data?: { status?: string };
					};
					return res;
				},
			};
		},
	};

	await controller.getVerificationStatus(req, res);

	assert.equal(responseCode, 200);
	assert.equal(responseBody?.success, true);
	assert.equal(responseBody?.data?.status, "UNDER_REVIEW");
});
