import { generateToken } from "@spotq-org/s2s-core";

/**
 * ============================================================================
 * PASTE YOUR QUEUE SERVICE RSA PRIVATE KEY HERE (PEM FORMAT)
 * ============================================================================
 * Paste your Queue Service private key between the backticks below.
 *
 * Example:
 * const QUEUE_SERVICE_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
 * MIIEowIBAAKCAQEA0...
 * -----END RSA PRIVATE KEY-----`;
 *
 * Alternatively, you can pass it via environment variable:
 * QUEUE_S2S_PRIVATE_KEY="-----BEGIN..." pnpm run token:s2s
 */
const QUEUE_SERVICE_PRIVATE_KEY =
	process.env.QUEUE_S2S_PRIVATE_KEY ||
	`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCijYQ3+oaR3WPA
JDRNSLpFppxmpzBE/BLnn+scVj8aVZeTTNVH38NhGucerrcfz7SjOjC3yZUMUfCe
iULde4neZMdETGXS1l0ClEjei32isWgyk5EG4rWddrXKkmZSCiNbyTf55SvgXQzI
iINh5e8FathCkeZiFUi+sKOSvcFqKL5lX/7pcyMMn+t62lYj6cUSL+SQjqSBfsDu
2vu6jSRxs/wwrdFLXtKJQo8HgJx+dkzoRraQNsyzZILu1BpBJIKwK1dz6EaiSaWu
rcAeY8vd6wv+tD00EoAJWvmzns7kozc8wFAEMncMqQ6EzMFZORyakLh3DRiJ/boC
Sob0l9oFAgMBAAECggEABaZxoBh/MPbHDtizULRkdSNTcGYDUYKJja+LVpLQ4rNy
71XOXA81FV0AB5r/FoX7u2i8ZMcG/USj3n7a6iPvKOHL413cdDWrSfmphsLGfS85
dfiXI+whb/W+X+oy0Es162zVG0SR/9x8I0RLfM2nP0L1fWrg3SvsOWSeau1Zmbz+
kqQ3ytmENwT9q0hAB6LLUk9wnf6wOzql40nh5RN6gf6W0/7sFSNjKECvHtFWkxnQ
s/Zl1TL8bBCOxGF4Zgaj87FP97zOYiGJd+0EaHwS31Anu1i1PGhOIfhjd4WFidHI
xFDmHIASSsn2UoVKk3X96kQXpmuvrMySwuclKcz6QQKBgQDgJ9Szi7vHneRwDMWI
Ypsi6QJtg1s7Mu3d4AXAUV23O3SNwAEPib8lZmJJXrHalKTgDk8r0KfhqsYSIKwd
Gci8+T1x8wSPuIyUahuD5D9ETUyNtdEGjUCiBjinMqwN0zpYpsE7rHTAHT2zssKX
ZuYphlc44Mae99MoEhnOrn5DvQKBgQC5pUswf/ULzssjS0C1fnYVVn5GHiLA+NWJ
nHTnBMnh67q7PehPH2haPaPh7C8Fvbi5S1ipIs892fvYw1dTSvp0UIWljdaqOKND
5h446WZ0wQ0ujSor9m+WSIagutMrOmRO9DUywK7Kngc2WvYJfy8O64re07V+r5Tu
JesJh7av6QKBgAVjD6qM9iNS+RV0SR8A96d8IBHPsVaX372QT7MSgYUQyblKXvwn
nE9iyYPn4bBWGCxGS8LKze4Pc5kl7dz5LKjV+JMPexGVJtO+RREDYD3c+bUCJJba
uC3splnmTto6NFHDGCu99kRTr5Ls/d4zm95tmxUD2eIiJJH29WXRLbmlAoGBAKRO
m6GtXqC4winWrMr1xmVUTCaa/X91vOkyxHTDVDrUfEzEmhuNXLqh265Vb7jRFfFJ
sorf+DRx/ej32w4pSkowCllglCHMRxQNU6pjSP8E7jnJTw3h6xlDz4PqVoPoBmeq
1Hq69vj1rMR69U+qdWfrKNnW3sfldxbgEIo6x4IhAoGAZ6zmGHZEtSC29oz+DGK1
xYphjQeDZp8PTNGqiKlQxTe7QuqhlSLoMLru4nSGedsSnDHbEy/oHTzyJnfDZTtL
p0WaDQMMQsiVrqgTJLTyiwP8fdXZjjKwHk/eC8RuXnotl9KKGstKSvN7ATmCIvaV
0LeZ2TAGdrxmK2zEvEmWYPo=
-----END PRIVATE KEY-----`;

// Target microservice audience (this service)
const TARGET_AUDIENCE = process.env.S2S_AUDIENCE || "queue-service";

// Caller Service Name
const CALLER_SERVICE = "order-service";

// Token expiration
const EXPIRATION = "1h";

async function main() {
	const keyBody = QUEUE_SERVICE_PRIVATE_KEY.replace(
		/-----BEGIN (?:RSA )?PRIVATE KEY-----|-----END (?:RSA )?PRIVATE KEY-----/g,
		"",
	).trim();

	if (
		!QUEUE_SERVICE_PRIVATE_KEY ||
		!keyBody ||
		QUEUE_SERVICE_PRIVATE_KEY.includes(
			"PASTE_YOUR_QUEUE_SERVICE_PRIVATE_KEY_HERE",
		)
	) {
		console.error(
			"\n❌ Error: Please paste your Queue Service RSA Private Key into QUEUE_SERVICE_PRIVATE_KEY variable in scripts/generate-s2s-token.ts\n",
		);
		console.log("Example in scripts/generate-s2s-token.ts:");
		console.log(
			"-----------------------------------------------------------------",
		);
		console.log(`const QUEUE_SERVICE_PRIVATE_KEY = \`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
-----END RSA PRIVATE KEY-----\`;`);
		console.log(
			"-----------------------------------------------------------------\n",
		);
		process.exit(1);
	}

	try {
		const token = generateToken(TARGET_AUDIENCE, {
			serviceName: CALLER_SERVICE,
			privateKey: QUEUE_SERVICE_PRIVATE_KEY,
			expiresIn: EXPIRATION,
		});

		console.log(
			"\n=================================================================",
		);
		console.log("🔑 S2S JWT TOKEN GENERATED SUCCESSFULLY");
		console.log(
			"=================================================================",
		);
		console.log("\nToken:\n");
		console.log(token);
		console.log(
			"\n=================================================================",
		);
		console.log("📋 POSTMAN CONFIGURATION");
		console.log(
			"=================================================================",
		);
		console.log("Method:  GET");
		console.log(
			"URL:     http://localhost:3000/api/internal/v1/restaurants/YOUR_RESTAURANT_UUID/validation",
		);
		console.log("\nHeaders (under Headers tab in Postman):");
		console.log(`  Authorization:    Bearer ${token}`);
		console.log(`  x-caller-service: ${CALLER_SERVICE}`);
		console.log(
			"=================================================================\n",
		);
	} catch (error) {
		console.error(
			"\n❌ Failed to generate token:",
			error instanceof Error ? error.message : error,
		);
		process.exit(1);
	}
}

main();
