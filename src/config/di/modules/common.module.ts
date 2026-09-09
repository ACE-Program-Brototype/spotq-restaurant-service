import type { BrevoClient } from "@getbrevo/brevo";
import type { PrismaClient } from "@prisma/client";
import { ContainerModule } from "inversify";
import type Redis from "ioredis";
import type { Queue } from "bullmq";
import type { IJwkService } from "@/application/ports/services/IJwk.service";
import type { ILogger } from "@/application/ports/services/logger.interface";
import type { IEmailWorker } from "@/application/ports/workers/email.worker.port";
import { brevoClient } from "@/config/brevo.client";
import { prisma } from "@/config/prisma";
import redis from "@/config/redis";
import { TYPES } from "@/config/di/types";
import {
	HealthCheckService,
	type IHealthCheckable,
} from "@/infrastructure/health/health-check.service";
import { logger } from "@/infrastructure/observability/logger";
import { emailQueue } from "@/infrastructure/queue/bullmq.service";
import { EmailWorker } from "@/infrastructure/queue/workers/email.worker";
import { JwksService } from "@/infrastructure/services/jwk.service";
import { JwksController } from "@/presentation/http/controllers/jwks.controller";

export const commonModule = new ContainerModule(({ bind }) => {
	// Database & Cache
	bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
	bind<Redis>(TYPES.RedisClient).toConstantValue(redis);

	// Observability & System
	bind<ILogger>(TYPES.Logger.PinoClient).toConstantValue(logger);
	bind<IHealthCheckable>(TYPES.HealthCheckService)
		.to(HealthCheckService)
		.inSingletonScope();

	// JWKS
	bind<IJwkService>(TYPES.JWKService).to(JwksService).inSingletonScope();
	bind<JwksController>(TYPES.JWKSController)
		.to(JwksController)
		.inSingletonScope();

	// Third-party Clients & BullMQ
	bind<BrevoClient>(TYPES.Brevo.Client).toConstantValue(brevoClient);
	bind<Queue>(TYPES.Queue.Email).toConstantValue(emailQueue);
	bind<IEmailWorker>(TYPES.Worker.EMAIL).to(EmailWorker);
});
