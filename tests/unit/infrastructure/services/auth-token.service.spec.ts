import jwt from "jsonwebtoken";
import { AuthTokenService } from "@/infrastructure/services/auth-token.service";

describe("AuthTokenService (Asymmetric RS256)", () => {
	let service: AuthTokenService;

	beforeEach(() => {
		service = new AuthTokenService();
	});

	it("should generate RS256 signed access token with required claims and kid header", () => {
		const payload = {
			restaurantId: "rest-uuid-123",
			email: "owner@restaurant.com",
		};

		const token = service.generateAccessToken(payload);
		expect(typeof token).toBe("string");

		const decodedHeader = jwt.decode(token, { complete: true })?.header;
		expect(decodedHeader?.alg).toBe("RS256");
		expect(decodedHeader?.kid).toBe("spotq-main-key");

		const decoded = service.verifyAccessToken(token);
		expect(decoded.restaurantId).toBe("rest-uuid-123");
		expect(decoded.email).toBe("owner@restaurant.com");
	});

	it("should generate and verify token pair", () => {
		const payload = {
			restaurantId: "rest-uuid-456",
			email: "admin@spotq.com",
		};

		const tokenPair = service.generateTokenPair(payload);
		expect(tokenPair.accessToken).toBeDefined();
		expect(tokenPair.refreshToken).toBeDefined();

		const accessDecoded = service.verifyAccessToken(tokenPair.accessToken);
		expect(accessDecoded.restaurantId).toBe("rest-uuid-456");

		const refreshDecoded = service.verifyRefreshToken(tokenPair.refreshToken);
		expect(refreshDecoded.restaurantId).toBe("rest-uuid-456");
	});
});
