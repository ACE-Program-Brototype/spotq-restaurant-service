import assert from "node:assert/strict";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, test } from "@jest/globals";
import cookieParser from "cookie-parser";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { AuthTokenService } from "@/infrastructure/services/auth-token.service";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";
import { restaurantAuthMiddleware } from "@/presentation/http/middleware/restaurant.auth.middleware";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";

describe("AuthTokenService & JWT Generation", () => {
	test("generates valid access token and refresh token containing restaurantId and email", () => {
		const service = new AuthTokenService();
		const payload = {
			restaurantId: "rest-12345-uuid",
			email: "owner@testrestaurant.com",
		};

		const tokens = service.generateTokenPair(payload);

		assert.ok(tokens.accessToken);
		assert.ok(tokens.refreshToken);

		const decodedAccess = jwt.decode(tokens.accessToken) as {
			restaurantId: string;
			email: string;
			sub: string;
			role: string;
		};
		assert.equal(decodedAccess.restaurantId, payload.restaurantId);
		assert.equal(decodedAccess.email, payload.email);
		assert.equal(decodedAccess.sub, payload.restaurantId);
		assert.equal(decodedAccess.role, "restaurant_owner");

		const decodedRefresh = jwt.decode(tokens.refreshToken) as {
			restaurantId: string;
			email: string;
			sub: string;
			role: string;
		};
		assert.equal(decodedRefresh.restaurantId, payload.restaurantId);
		assert.equal(decodedRefresh.email, payload.email);
		assert.equal(decodedRefresh.sub, payload.restaurantId);
		assert.equal(decodedRefresh.role, "restaurant_owner");
	});
});

describe("restaurantAuthMiddleware", () => {
	test("returns 401 when no restaurant identity header or token is provided", () => {
		const req = {
			headers: {},
			params: {},
		} as unknown as Request;

		let statusCode = 0;
		let responseJson: unknown = null;

		const res = {
			status: (code: number) => {
				statusCode = code;
				return {
					json: (body: unknown) => {
						responseJson = body;
						return res;
					},
				};
			},
		} as unknown as Response;

		let nextCalled = false;
		const next = () => {
			nextCalled = true;
		};

		restaurantAuthMiddleware(req, res, next);

		assert.equal(nextCalled, false);
		assert.equal(statusCode, 401);
		assert.ok(responseJson);
	});

	test("authenticates successfully via x-restaurant-id header", () => {
		const req = {
			headers: {
				"x-restaurant-id": "rest-hdr-123",
				"x-user-email": "owner@restaurant.com",
				"x-user-role": "RESTAURANT_OWNER",
			},
			params: {},
		} as unknown as Request;

		const res = {} as Response;
		let nextCalled = false;
		const next = () => {
			nextCalled = true;
		};

		restaurantAuthMiddleware(req, res, next);

		assert.equal(nextCalled, true);
		assert.equal(req.userId, "rest-hdr-123");
		const user = req.user as { restaurantId: string; email: string };
		assert.equal(user.restaurantId, "rest-hdr-123");
		assert.equal(user.email, "owner@restaurant.com");
	});

	test("authenticates successfully via Authorization Bearer JWT token fallback", () => {
		const authTokenService = new AuthTokenService();
		const accessToken = authTokenService.generateAccessToken({
			restaurantId: "rest-bearer-456",
			email: "bearer@restaurant.com",
		});

		const req = {
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
			params: {},
		} as unknown as Request;

		const res = {} as Response;
		let nextCalled = false;
		const next = () => {
			nextCalled = true;
		};

		restaurantAuthMiddleware(req, res, next);

		assert.equal(nextCalled, true);
		assert.equal(req.userId, "rest-bearer-456");
		const user = req.user as { restaurantId: string; email: string };
		assert.equal(user.restaurantId, "rest-bearer-456");
		assert.equal(user.email, "bearer@restaurant.com");
	});
});

describe("RestaurantAuthController Unit Tests", () => {
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
		} as unknown as Request;

		const res = {
			cookie: () => {},
		} as unknown as Response;

		await assert.rejects(
			() => controller.refreshAccessToken(req, res),
			InvalidRefreshTokenError,
		);
	});

	test("onboard extracts restaurantId correctly and executes onboardRestaurantUseCase", async () => {
		let capturedRestaurantId = "";
		let capturedDto: unknown = null;

		const mockOnboardUseCase = {
			execute: async (dto: unknown, id: string) => {
				capturedDto = dto;
				capturedRestaurantId = id;
			},
		};

		const controller = new RestaurantAuthController(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			mockOnboardUseCase as never,
			{} as never,
		);

		const req = {
			body: { restaurantName: "Test Diner", phone: "9876543210" },
			user: { restaurantId: "rest-onboard-789" },
		} as unknown as Request;

		let responseCode = 0;
		let responseBody: Record<string, unknown> | null = null;

		const mockRes: Record<string, unknown> = {};
		mockRes.status = (code: number) => {
			responseCode = code;
			return {
				json: (body: unknown) => {
					responseBody = body as Record<string, unknown>;
					return mockRes;
				},
			};
		};
		const res = mockRes as unknown as Response;

		await controller.onboard(req, res);

		const onboardBody = responseBody as Record<string, unknown> | null;
		assert.equal(capturedRestaurantId, "rest-onboard-789");
		assert.deepEqual(capturedDto, {
			restaurantName: "Test Diner",
			phone: "9876543210",
		});
		assert.equal(responseCode, 201);
		assert.equal(onboardBody?.success, true);
	});

	test("getVerificationStatus returns status for restaurant id from params or user context", async () => {
		const mockResult = {
			status: "UNDER_REVIEW" as const,
			submittedAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		};

		let capturedId = "";
		const mockUseCase = {
			execute: async (id: string) => {
				capturedId = id;
				return mockResult;
			},
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
			params: { id: "rest-status-123" },
		} as unknown as Request;

		let responseCode = 0;
		let responseBody: Record<string, unknown> | null = null;

		const mockResStatus: Record<string, unknown> = {};
		mockResStatus.status = (code: number) => {
			responseCode = code;
			return {
				json: (body: unknown) => {
					responseBody = body as Record<string, unknown>;
					return mockResStatus;
				},
			};
		};
		const res = mockResStatus as unknown as Response;

		await controller.getVerificationStatus(req, res);

		const statusBody = responseBody as Record<string, unknown> | null;
		assert.equal(capturedId, "rest-status-123");
		assert.equal(responseCode, 200);
		assert.equal(statusBody?.success, true);
		assert.equal(
			(statusBody?.data as Record<string, unknown>)?.status,
			"UNDER_REVIEW",
		);
	});
});

describe("End-to-End Restaurant Auth Routes Integration", () => {
	let server: Server;
	let baseUrl: string;

	const mockSendOtpUseCase = { execute: async () => {} };
	const mockResendOtpUseCase = { execute: async () => {} };
	const mockVerifyOtpUseCase = {
		execute: async () => ({
			nextStep: "ONBOARDING",
			restaurantId: "rest-e2e-100",
			accessToken: new AuthTokenService().generateAccessToken({
				restaurantId: "rest-e2e-100",
				email: "e2e@restaurant.com",
			}),
			refreshToken: new AuthTokenService().generateRefreshToken({
				restaurantId: "rest-e2e-100",
				email: "e2e@restaurant.com",
			}),
		}),
	};
	const mockRefreshTokenUseCase = {
		execute: async () => ({
			accessToken: new AuthTokenService().generateAccessToken({
				restaurantId: "rest-e2e-100",
				email: "e2e@restaurant.com",
			}),
		}),
	};
	const mockOnboardUseCase = { execute: async () => {} };
	const mockVerificationStatusUseCase = {
		execute: async (id: string) => ({
			status: "PENDING",
			submittedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			restaurantId: id,
		}),
	};

	const controller = new RestaurantAuthController(
		mockSendOtpUseCase as never,
		mockResendOtpUseCase as never,
		mockVerifyOtpUseCase as never,
		mockRefreshTokenUseCase as never,
		mockOnboardUseCase as never,
		mockVerificationStatusUseCase as never,
	);

	beforeAll(async () => {
		const app = express();
		app.use(express.json());
		app.use(cookieParser());

		const router = express.Router();

		router.post(
			RESTAURANT_ROUTES.EMAIL_OTP,
			controller.sendEmailOtp.bind(controller),
		);
		router.post(
			RESTAURANT_ROUTES.RESEND_EMAIL_OTP,
			controller.resendEmailOtp.bind(controller),
		);
		router.post(
			RESTAURANT_ROUTES.VERIFY_EMAIL,
			controller.verifyEmailOtp.bind(controller),
		);
		router.post(
			RESTAURANT_ROUTES.REFRESH_ACCESS_TOKEN,
			controller.refreshAccessToken.bind(controller),
		);
		router.post(
			RESTAURANT_ROUTES.ONBOARD,
			restaurantAuthMiddleware,
			controller.onboard.bind(controller),
		);
		router.get(
			RESTAURANT_ROUTES.VERIFICATION_STATUS,
			restaurantAuthMiddleware,
			controller.getVerificationStatus.bind(controller),
		);
		router.get(
			RESTAURANT_ROUTES.VERIFICATION_STATUS_BY_ID,
			restaurantAuthMiddleware,
			controller.getVerificationStatus.bind(controller),
		);

		app.use(router);

		await new Promise<void>((resolve) => {
			server = app.listen(0, () => {
				const addr = server.address();
				if (addr && typeof addr === "object") {
					baseUrl = `http://127.0.0.1:${addr.port}`;
				}
				resolve();
			});
		});
	});

	afterAll(async () => {
		if (server) {
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});

	test("POST /registration/email-otp returns 202 Accepted", async () => {
		const res = await fetch(`${baseUrl}/registration/email-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "test@restaurant.com" }),
		});

		assert.equal(res.status, 202);
		const json = (await res.json()) as { success: boolean };
		assert.equal(json.success, true);
	});

	test("POST /registration/email-otp/verify returns token and sets HTTP-only refresh cookie", async () => {
		const res = await fetch(`${baseUrl}/registration/email-otp/verify`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "test@restaurant.com", otp: "123456" }),
		});

		assert.equal(res.status, 200);
		const setCookie = res.headers.get("set-cookie");
		assert.ok(setCookie?.includes("refreshToken="));

		const json = (await res.json()) as {
			success: boolean;
			data: { nextStep: string; restaurantId: string; accessToken: string };
		};
		assert.equal(json.success, true);
		assert.equal(json.data.nextStep, "ONBOARDING");
		assert.equal(json.data.restaurantId, "rest-e2e-100");
		assert.ok(json.data.accessToken);
	});

	test("POST /onboard succeeds with x-restaurant-id header", async () => {
		const res = await fetch(`${baseUrl}/onboard`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-restaurant-id": "rest-e2e-100",
			},
			body: JSON.stringify({ restaurantName: "E2E Diner" }),
		});

		assert.equal(res.status, 201);
		const json = (await res.json()) as { success: boolean };
		assert.equal(json.success, true);
	});

	test("POST /onboard succeeds with Authorization Bearer JWT token", async () => {
		const token = new AuthTokenService().generateAccessToken({
			restaurantId: "rest-e2e-bearer-200",
			email: "e2ebearer@restaurant.com",
		});

		const res = await fetch(`${baseUrl}/onboard`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ restaurantName: "Bearer Diner" }),
		});

		assert.equal(res.status, 201);
		const json = (await res.json()) as { success: boolean };
		assert.equal(json.success, true);
	});

	test("GET /verification-status returns status data", async () => {
		const res = await fetch(`${baseUrl}/verification-status`, {
			method: "GET",
			headers: {
				"x-restaurant-id": "rest-e2e-100",
			},
		});

		assert.equal(res.status, 200);
		const json = (await res.json()) as {
			success: boolean;
			data: { status: string; restaurantId: string };
		};
		assert.equal(json.success, true);
		assert.equal(json.data.status, "PENDING");
		assert.equal(json.data.restaurantId, "rest-e2e-100");
	});

	test("GET /:id/verification-status returns status data for path param id", async () => {
		const res = await fetch(`${baseUrl}/rest-e2e-555/verification-status`, {
			method: "GET",
		});

		assert.equal(res.status, 200);
		const json = (await res.json()) as {
			success: boolean;
			data: { status: string; restaurantId: string };
		};
		assert.equal(json.success, true);
		assert.equal(json.data.restaurantId, "rest-e2e-555");
	});

	test("POST /onboard fails with 401 when no authentication headers or token provided", async () => {
		const res = await fetch(`${baseUrl}/onboard`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ restaurantName: "Unauthorized Diner" }),
		});

		assert.equal(res.status, 401);
	});
});
