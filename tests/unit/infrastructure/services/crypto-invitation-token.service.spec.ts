import { describe, expect, it } from "@jest/globals";
import { CryptoInvitationTokenService } from "@/infrastructure/services/crypto-invitation-token.service.ts";

describe("CryptoInvitationTokenService", () => {
	const service = new CryptoInvitationTokenService();

	it("should generate a random rawToken and its corresponding sha256 hash", () => {
		const result = service.generateToken();

		expect(result.rawToken).toBeDefined();
		expect(typeof result.rawToken).toBe("string");
		expect(result.rawToken.length).toBe(64); // 32 bytes hex = 64 characters

		expect(result.tokenHash).toBeDefined();
		expect(typeof result.tokenHash).toBe("string");
		expect(result.tokenHash.length).toBe(64); // SHA-256 hex = 64 characters

		const expectedHash = service.hashToken(result.rawToken);
		expect(result.tokenHash).toBe(expectedHash);
	});

	it("should generate different tokens across invocations", () => {
		const token1 = service.generateToken();
		const token2 = service.generateToken();

		expect(token1.rawToken).not.toBe(token2.rawToken);
		expect(token1.tokenHash).not.toBe(token2.tokenHash);
	});
});
