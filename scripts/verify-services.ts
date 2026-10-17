if (!process.env.PORT) {
	try {
		process.loadEnvFile?.(".env");
	} catch {}
}

import { env } from "@/config/env";
import { prisma } from "@/config/prisma";
import redis from "@/config/redis";
import { checkS3Connection } from "@/infrastructure/storage/s3.connect";

function maskUrl(urlString: string): string {
	try {
		const parsed = new URL(urlString);
		return `${parsed.protocol}//${parsed.username ? "***:***@" : ""}${parsed.host}${parsed.pathname}`;
	} catch {
		return "invalid-url";
	}
}

async function verifyAll() {
	console.log("\n=======================================================");
	console.log("   SpotQ Restaurant Service - Credentials & Auth Check");
	console.log("=======================================================\n");

	let allPassed = true;

	// 1. Check PostgreSQL (Aiven DB)
	console.log(`[1/3] Testing PostgreSQL (Database)...`);
	console.log(`      Endpoint: ${maskUrl(env.DATABASE_URL)}`);
	try {
		await prisma.$connect();
		await prisma.$queryRaw`SELECT 1`;
		console.log(`      ✅ PostgreSQL / Aiven DB Authenticated & Connected!\n`);
	} catch (error: unknown) {
		allPassed = false;
		console.error(`      ❌ PostgreSQL / Aiven DB Connection FAILED:`);
		console.error(
			`         ${error instanceof Error ? error.message : String(error)}\n`,
		);
	} finally {
		await prisma.$disconnect().catch(() => {});
	}

	// 2. Check Redis (Aiven Redis / Cache)
	console.log(`[2/3] Testing Redis (Cache & Queues)...`);
	console.log(`      Endpoint: ${maskUrl(env.REDIS_URL)}`);
	try {
		const response = await redis.ping();
		console.log(
			`      ✅ Redis Authenticated & Connected! (Ping: ${response})\n`,
		);
	} catch (error: unknown) {
		allPassed = false;
		console.error(`      ❌ Redis Connection FAILED:`);
		console.error(
			`         ${error instanceof Error ? error.message : String(error)}\n`,
		);
	} finally {
		await redis.quit().catch(() => {});
	}

	// 3. Check AWS S3
	console.log(`[3/3] Testing AWS S3 (Storage)...`);
	console.log(`      Bucket: ${env.AWS_S3_BUCKET}`);
	console.log(`      Region: ${env.AWS_REGION}`);
	console.log(
		`      AccessKey: ${env.AWS_ACCESS_KEY_ID ? `${env.AWS_ACCESS_KEY_ID.substring(0, 4)}...` : "NOT SET"}`,
	);
	try {
		await checkS3Connection();
		console.log(`      ✅ AWS S3 Authenticated & Bucket Verified!\n`);
	} catch (error: unknown) {
		allPassed = false;
		console.error(`      ❌ AWS S3 Verification FAILED:`);
		console.error(
			`         ${error instanceof Error ? error.message : String(error)}\n`,
		);
	}

	console.log("=======================================================");
	if (allPassed) {
		console.log("🎉 All services (DB, Redis, S3) are authenticated & working!");
	} else {
		console.log(
			"⚠️ Some services failed verification. Please review the errors above.",
		);
	}
	console.log("=======================================================\n");

	process.exit(allPassed ? 0 : 1);
}

verifyAll();
