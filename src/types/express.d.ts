import "express";
import type jwt from "jsonwebtoken";

export interface AuthenticatedStaff {
	userId: string;
	restaurantId: string;
	email: string;
	role: string;
}

export interface AuthenticatedRestaurant {
	restaurantId: string;
	userId?: string;
	email?: string;
	role?: string;
}

export interface AuthenticatedOwner {
	userId: string;
	restaurantId: string;
	email: string;
	role: string;
}

declare global {
	namespace Express {
		interface Request {
			userId?: string;
			user?:
				| AuthenticatedStaff
				| AuthenticatedRestaurant
				| AuthenticatedOwner
				| jwt.JwtPayload
				| string;
		}
	}
}
