import type { JWK } from "jose";

export interface IJwkService {
	getJwks(): Promise<{ keys: JWK[] }>;
}
