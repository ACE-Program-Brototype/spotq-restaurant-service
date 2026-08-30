export interface StaffTokenPayload {
	id: string;
	restaurantId: string;
	email: string;
	role: string;
}

export interface StaffTempTokenPayload {
	id: string;
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
