import "reflect-metadata";
import { Container } from "inversify";
import { applicationModule } from "./modules/application.module.ts";
import { databaseModule } from "./modules/database.module.ts";
import { presentationModule } from "./modules/presentation.module.ts";
import { servicesModule } from "./modules/services.module.ts";
import { systemModule } from "./modules/system.module.ts";

export const container = new Container({
	defaultScope: "Singleton",
});

container.load(
	databaseModule,
	servicesModule,
	applicationModule,
	presentationModule,
	systemModule,
);
