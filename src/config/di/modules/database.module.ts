import type { PrismaClient } from "@prisma/client";
import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { prisma } from "@/config/prisma.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { PrismaRestaurantStaffRepository } from "@/infrastructure/database/repositories/prisma-restaurant-staff.repository.ts";

export const databaseModule = new ContainerModule((bind) => {
	bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
	bind<IRestaurantStaffRepository>(TYPES.RestaurantStaffRepository)
		.to(PrismaRestaurantStaffRepository)
		.inSingletonScope();
});
