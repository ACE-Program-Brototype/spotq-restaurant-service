import "express";
import type jwt from "jsonwebtoken";

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
			user?: AuthenticatedStaff | jwt.JwtPayload | string;
		}
	}
}
