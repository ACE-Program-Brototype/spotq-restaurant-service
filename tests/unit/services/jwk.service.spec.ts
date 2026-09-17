import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { JwksService } from "@/infrastructure/services/jwk.service";
import { JwksController } from "@/presentation/http/controllers/jwks.controller";

describe("JwksService & JwksController", () => {
	it("should generate JWKS keys containing kid, alg, and sig use", async () => {
		const service = new JwksService();
		const jwks = await service.getJwks();

		expect(jwks).toBeDefined();
		expect(Array.isArray(jwks.keys)).toBe(true);
		expect(jwks.keys.length).toBeGreaterThan(0);

		const key = jwks.keys[0];
		expect(key.kty).toBe("RSA");
		expect(key.use).toBe("sig");
		expect(key.alg).toBeDefined();
		expect(key.kid).toBeDefined();
	});

	it("should return JWKS response with HTTP 200 via JwksController", async () => {
		const mockService = {
			getJwks: jest.fn().mockResolvedValue({
				keys: [{ kid: "key-1", kty: "RSA", use: "sig", alg: "RS256" }],
			}),
		};

		const controller = new JwksController(mockService as never);

		const jsonMock = jest.fn().mockImplementation((data) => data);
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
		} as unknown as Response;

		await controller.getJwks({} as Request, res);

		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith({
			keys: [{ kid: "key-1", kty: "RSA", use: "sig", alg: "RS256" }],
		});
	});
});
