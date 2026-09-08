import "express";

export interface AuthenticatedStaff {
	userId: string;
	restaurantId: string;
	email: string;
	role: string;
}

declare global {
	namespace Express {
		interface Request {
			userId?: string;
			user?: AuthenticatedStaff;
		}
	}
}
