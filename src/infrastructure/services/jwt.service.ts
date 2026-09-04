import type { IJwkService } from "@application/ports/services/IJwk.service";
import { env } from "@config/env";
import { exportJWK, importSPKI } from "jose";

export class JwksService implements IJwkService {
	public async getJwks() {
		const publicKey = await importSPKI(
			env.JWT_ACCESS_PUBLIC_KEY,
			env.JWT_ALGORITHM as string,
		);

		const jwk = await exportJWK(publicKey);

		return {
			keys: [
				{
					...jwk,
					kid: env.JWT_ACCESS_TOKEN_KEY_ID,
					alg: env.JWT_ALGORITHM,
					use: "sig",
				},
			],
		};
	}
}
