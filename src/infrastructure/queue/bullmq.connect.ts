import { testQueue } from "./bullmq.service.js";

export async function connectBullMQ(): Promise<void> {
	await testQueue.waitUntilReady();
	console.log("✅ BullMQ connected");
}

export async function disconnectBullMQ(): Promise<void> {
	await testQueue.close();
	console.log("📦 BullMQ disconnected");
}
