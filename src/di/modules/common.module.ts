import type { BrevoClient } from "@getbrevo/brevo";
import type { PrismaClient } from "@prisma/client/extension";
import type { Queue } from "bullmq";
import { ContainerModule } from "inversify";
import type Redis from "ioredis";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { brevoClient } from "@/config/brevo.client";
import { prisma } from "@/config/prisma";
import redis from "@/config/redis";
import { logger } from "@/infrastructure/observability/logger";
import { emailQueue } from "@/infrastructure/queue/bullmq.service";
import { EmailWorker } from "@/infrastructure/queue/workers/email.worker";
import { TYPES } from "../types";

export const commonModule = new ContainerModule(({ bind }) => {
	bind<PrismaClient>(TYPES.Database.PrismaClient).toConstantValue(prisma);

	bind<Redis>(TYPES.Redis.Client).toConstantValue(redis);

	bind<ILogger>(TYPES.Logger.PinoClient).toConstantValue(logger);

	bind<BrevoClient>(TYPES.Brevo.Client).toConstantValue(brevoClient);

	bind<Queue>(TYPES.Queue.Email).toConstantValue(emailQueue);

	bind<IEmailWorker>(TYPES.Worker.EMAIL).to(EmailWorker);
});
