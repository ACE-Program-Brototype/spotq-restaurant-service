import "express";
import type jwt from "jsonwebtoken";

export interface AuthenticatedUser {
	userId: string;
	restaurantId: string;
	email: string;
	role: string;
}

export interface AuthenticatedAdmin {
	userId: string;
	email: string;
	role: string;
}

export interface AuthenticatedRestaurant {
	restaurantId: string;
	userId?: string;
	email?: string;
	role?: string;
}

export type AuthenticatedStaff = AuthenticatedUser;
export type AuthenticatedOwner = AuthenticatedUser;

declare global {
	namespace Express {
		interface Request {
			userId?: string;
			user?:
				| AuthenticatedStaff
				| AuthenticatedAdmin
				| AuthenticatedRestaurant
				| AuthenticatedOwner
				| AuthenticatedUser
				| jwt.JwtPayload
				| string;
		}
	}
}
