export interface ITokenRevocationRepository {
	revoke(token: string, ttlSeconds?: number): Promise<void>;
	isRevoked(token: string): Promise<boolean>;
}
