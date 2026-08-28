export interface StaffTokenPayload {
	id: string;
	restaurantId: string;
	email: string;
	role: string;
}

export interface ITokenService {
	generateAccessToken(payload: StaffTokenPayload): string;
	generateRefreshToken(payload: StaffTokenPayload): string;
	verifyAccessToken(token: string): StaffTokenPayload;
	verifyRefreshToken(token: string): StaffTokenPayload;
}
