import type { PrismaClient } from "@prisma/client";
import { ContainerModule } from "inversify";
import type { Redis } from "ioredis";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { prisma } from "@/config/prisma.ts";
import redis from "@/config/redis.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IStaffInvitationRepository } from "@/domain/repositories/staff-invitation.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";
import { PrismaRestaurantStaffRepository } from "@/infrastructure/database/repositories/prisma-restaurant-staff.repository.ts";
import { PrismaStaffInvitationRepository } from "@/infrastructure/database/repositories/prisma-staff-invitation.repository.ts";
import { RedisOtpRepository } from "@/infrastructure/database/repositories/redis-otp.repository.ts";
import { RedisTokenRevocationRepository } from "@/infrastructure/database/repositories/redis-token-revocation.repository.ts";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository.ts";

export const databaseModule = new ContainerModule(({ bind }) => {
	bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
	bind<Redis>(TYPES.RedisClient).toConstantValue(redis);
	bind<IRestaurantStaffRepository>(TYPES.RestaurantStaffRepository)
		.to(PrismaRestaurantStaffRepository)
		.inSingletonScope();
	bind<IStaffInvitationRepository>(TYPES.StaffInvitationRepository)
		.to(PrismaStaffInvitationRepository)
		.inSingletonScope();
	bind<IRestaurantRepository>(TYPES.RestaurantRepository).toDynamicValue(
		() => new RestaurantRepository(prisma),
	);
	bind<ITokenRevocationRepository>(TYPES.TokenRevocationRepository)
		.to(RedisTokenRevocationRepository)
		.inSingletonScope();
	bind<IOtpRepository>(TYPES.OtpRepository)
		.to(RedisOtpRepository)
		.inSingletonScope();
});
