export interface IAuthTokenService {
	generateAccessToken(payload: AuthTokenPayload): string;

	generateRefreshToken(payload: AuthTokenPayload): string;

	generateTokenPair(payload: AuthTokenPayload): TokenPair;

	verifyAccessToken(token: string): AuthTokenPayload;

	verifyRefreshToken(token: string): AuthTokenPayload;
}

export interface AuthTokenPayload {
	restaurantId: string;
	email: string;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}