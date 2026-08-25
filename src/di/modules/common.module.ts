import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { prisma } from "@/config/prisma";
import type { PrismaClient } from "@prisma/client/extension";

export const commonModule = new ContainerModule(
    ({ bind }) => {

        bind<PrismaClient>(TYPES.Database.PrismaClient).toConstantValue(prisma);

    },
);
