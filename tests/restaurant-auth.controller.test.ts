import assert from "node:assert/strict";
import test from "node:test";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
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
