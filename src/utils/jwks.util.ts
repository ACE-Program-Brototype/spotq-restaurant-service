import crypto from "node:crypto";
import { env } from "@/config/env.ts";

export interface JsonWebKey {
	kty: string;
	use: string;
	alg: string;
	kid: string;
	n: string;
	e: string;
}

export interface JsonWebKeySet {
	keys: JsonWebKey[];
}

let cachedJwks: JsonWebKeySet | null = null;

export function getJwks(): JsonWebKeySet {
	if (cachedJwks) {
		return cachedJwks;
	}

	const publicKey = env.JWT_PUBLIC_KEY;
	const keyObj = crypto.createPublicKey(publicKey);
	const jwk = keyObj.export({ format: "jwk" });

	cachedJwks = {
		keys: [
			{
				kty: jwk.kty ?? env.JWT_KEY_TYPE,
				use: env.JWT_KEY_USE,
				alg: env.JWT_ALGORITHM,
				kid: env.JWT_KEY_ID,
				n: jwk.n ?? "",
				e: jwk.e ?? "",
			},
		],
	};

	return cachedJwks;
}
