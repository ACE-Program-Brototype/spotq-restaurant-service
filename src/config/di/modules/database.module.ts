import type { PrismaClient } from "@prisma/client";
import { ContainerModule } from "inversify";
import type { Redis } from "ioredis";
import { TYPES } from "@/config/di/types.ts";
import { prisma } from "@/config/prisma.ts";
import redis from "@/config/redis.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";
import { PrismaRestaurantStaffRepository } from "@/infrastructure/database/repositories/prisma-restaurant-staff.repository.ts";
import { RedisTokenRevocationRepository } from "@/infrastructure/database/repositories/redis-token-revocation.repository.ts";

export const databaseModule = new ContainerModule((bind) => {
	bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
	bind<Redis>(TYPES.RedisClient).toConstantValue(redis);
	bind<IRestaurantStaffRepository>(TYPES.RestaurantStaffRepository)
		.to(PrismaRestaurantStaffRepository)
		.inSingletonScope();
	bind<ITokenRevocationRepository>(TYPES.TokenRevocationRepository)
		.to(RedisTokenRevocationRepository)
		.inSingletonScope();
});
