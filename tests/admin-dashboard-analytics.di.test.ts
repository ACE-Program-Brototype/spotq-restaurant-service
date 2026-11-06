import "reflect-metadata";
import { afterAll, describe, expect, it } from "@jest/globals";
import type Redis from "ioredis";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { GetPlatformDashboardAnalyticsUseCase } from "@/application/use-cases/admin/get-platform-dashboard-analytics.use-case.ts";
import { container } from "@/config/di/container.ts";
import { adminDashboardAnalyticsController } from "@/config/di/controllers.resolutions.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import { PrismaRestaurantAnalyticsRepository } from "@/infrastructure/database/repositories/prisma-restaurant-analytics.repository.ts";
import { PaymentAnalyticsService } from "@/infrastructure/external/payment-analytics.service.ts";
import { AdminDashboardAnalyticsController } from "@/presentation/http/controllers/admin-dashboard-analytics.controller.ts";

describe("Step 7: Admin Dashboard Analytics DI Resolution", () => {
	afterAll(async () => {
		try {
			const redis = container.get<Redis>(TYPES.RedisClient);
			redis.disconnect();
		} catch {
			// ignore cleanup error
		}
	});

	it("1. should resolve PrismaRestaurantAnalyticsRepository from container", () => {
		const repo = container.get<IRestaurantAnalyticsRepository>(
			TYPES.Repositories.RestaurantAnalyticsRepository,
		);
		expect(repo).toBeInstanceOf(PrismaRestaurantAnalyticsRepository);
	});

	it("2. should resolve PaymentAnalyticsService from container", () => {
		const service = container.get<PaymentAnalyticsService>(
			TYPES.Services.PaymentAnalyticsService,
		);
		expect(service).toBeInstanceOf(PaymentAnalyticsService);
	});

	it("3. should resolve GetPlatformDashboardAnalyticsUseCase with all dependencies injected", () => {
		const useCase = container.get<IGetPlatformDashboardAnalyticsUseCase>(
			TYPES.UseCases.GetPlatformDashboardAnalyticsUseCase,
		);
		expect(useCase).toBeInstanceOf(GetPlatformDashboardAnalyticsUseCase);
	});

	it("4. should resolve AdminDashboardAnalyticsController via TYPES.Controller token", () => {
		const controller = container.get<AdminDashboardAnalyticsController>(
			TYPES.Controller.AdminDashboardAnalyticsController,
		);
		expect(controller).toBeInstanceOf(AdminDashboardAnalyticsController);
	});

	it("5. should resolve adminDashboardAnalyticsController via controllers.resolutions", () => {
		expect(adminDashboardAnalyticsController).toBeInstanceOf(
			AdminDashboardAnalyticsController,
		);
	});
});
