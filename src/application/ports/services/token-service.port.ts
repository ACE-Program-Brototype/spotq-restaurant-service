export interface StaffTokenPayload {
	sub: string;
	restaurantId: string;
	email: string;
	role: string;
}

export interface StaffTempTokenPayload {
	sub: string;
	email: string;
	purpose: string;
}

export interface ITokenService {
	generateAccessToken(payload: StaffTokenPayload): string;
	generateRefreshToken(payload: StaffTokenPayload): string;
	verifyAccessToken(token: string): StaffTokenPayload;
	verifyRefreshToken(token: string): StaffTokenPayload;
	generateTempToken(payload: StaffTempTokenPayload): string;
	verifyTempToken(token: string): StaffTempTokenPayload;
}
