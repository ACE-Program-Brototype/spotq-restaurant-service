import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { prisma } from "@/config/prisma";
import type { PrismaClient } from "@prisma/client/extension";
import type Redis from "ioredis";
import redis from "@/config/redis";
import { logger } from "@/infrastructure/observability/logger";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { BrevoClient } from "@getbrevo/brevo";
import { brevoClient } from "@/config/brevo.client";
import type { Queue } from "bullmq";
import { emailQueue } from "@/infrastructure/queue/bullmq.service";

export const commonModule = new ContainerModule(({ bind }) => {
	bind<PrismaClient>(TYPES.Database.PrismaClient).toConstantValue(prisma);

	bind<Redis>(TYPES.Redis.Client).toConstantValue(redis);

	bind<ILogger>(TYPES.Logger.PinoClient).toConstantValue(logger);

	bind<BrevoClient>(TYPES.Brevo.Client).toConstantValue(brevoClient);

	bind<Queue>(TYPES.Queue.Email).toConstantValue(emailQueue);
});
