import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { prisma } from "@/config/prisma";
import type { PrismaClient } from "@prisma/client/extension";
import type Redis from "ioredis";
import redis from "@/config/redis";

export const commonModule = new ContainerModule(
    ({ bind }) => {

        bind<PrismaClient>(TYPES.Database.PrismaClient).toConstantValue(prisma);

        bind<Redis>(TYPES.Redis.Client).toConstantValue(redis);

    },
);
