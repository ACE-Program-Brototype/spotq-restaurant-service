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

-----END PRIVATE KEY-----`;

// Target microservice audience (this service)
const TARGET_AUDIENCE = process.env.S2S_AUDIENCE || "restaurant-service";

// Caller Service Name
const CALLER_SERVICE = "queue-service";

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
