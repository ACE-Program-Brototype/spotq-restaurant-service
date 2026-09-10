import { getJwks } from "@/utils/jwks.util";

describe("JWKS Utility", () => {
	it("should export valid JWKS set with RSA public key attributes", () => {
		const jwks = getJwks();
		expect(jwks).toBeDefined();
		expect(Array.isArray(jwks.keys)).toBe(true);
		expect(jwks.keys.length).toBeGreaterThan(0);

		const key = jwks.keys[0];
		expect(key.kty).toBe("RSA");
		expect(key.use).toBe("sig");
		expect(key.alg).toBe("RS256");
		expect(key.kid).toBe("spotq-main-key");
		expect(key.n).toBeDefined();
		expect(key.e).toBeDefined();
	});
});
