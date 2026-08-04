import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/db.js";
import { connectBullMQ, disconnectBullMQ } from "./infrastructure/queue/bullmq.connect.js";
import { connectRedis, disconnectRedis } from "./infrastructure/redis/redis.js";
import { PORT } from "./shared/constants/app.constants.js";

async function bootstrap() {
  try {
    await connectDatabase();

    await connectRedis()

    await connectBullMQ()

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    async function shutdown(signal: string) {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await disconnectRedis()
        await disconnectDatabase();
        await disconnectBullMQ()

        console.log("✅ Shutdown completed");
        process.exit(0);
      });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
}

bootstrap();
