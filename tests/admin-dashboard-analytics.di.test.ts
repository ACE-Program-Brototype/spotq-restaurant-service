import "reflect-metadata";
import { afterAll, describe, expect, it } from "@jest/globals";
import type Redis from "ioredis";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { GetPlatformDashboardAnalyticsUseCase } from "@/application/use-cases/admin/get-platform-dashboard-analytics.use-case.ts";
import { GetRestaurantAnalyticsDashboardUseCase } from "@/application/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.ts";
import { container } from "@/config/di/container.ts";
import {
	adminDashboardAnalyticsController,
	restaurantAnalyticsController,
} from "@/config/di/controllers.resolutions.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import { PrismaRestaurantAnalyticsRepository } from "@/infrastructure/database/repositories/prisma-restaurant-analytics.repository.ts";
import { OrderAnalyticsService } from "@/infrastructure/external/order-analytics.service.ts";
import { PaymentAnalyticsService } from "@/infrastructure/external/payment-analytics.service.ts";
import { UserAnalyticsService } from "@/infrastructure/external/user-analytics.service.ts";
import { AdminDashboardAnalyticsController } from "@/presentation/http/controllers/admin-dashboard-analytics.controller.ts";
import { RestaurantAnalyticsController } from "@/presentation/http/controllers/restaurant-analytics.controller.ts";

describe("Analytics BFF DI Resolution", () => {
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

	it("3. should resolve UserAnalyticsService from container", () => {
		const service = container.get<UserAnalyticsService>(
			TYPES.Services.UserAnalyticsService,
		);
		expect(service).toBeInstanceOf(UserAnalyticsService);
	});

	it("4. should resolve OrderAnalyticsService from container", () => {
		const service = container.get<OrderAnalyticsService>(
			TYPES.Services.OrderAnalyticsService,
		);
		expect(service).toBeInstanceOf(OrderAnalyticsService);
	});

	it("5. should resolve GetPlatformDashboardAnalyticsUseCase with all dependencies injected", () => {
		const useCase = container.get<IGetPlatformDashboardAnalyticsUseCase>(
			TYPES.UseCases.GetPlatformDashboardAnalyticsUseCase,
		);
		expect(useCase).toBeInstanceOf(GetPlatformDashboardAnalyticsUseCase);
	});

	it("6. should resolve GetRestaurantAnalyticsDashboardUseCase with all dependencies injected", () => {
		const useCase = container.get<IGetRestaurantAnalyticsDashboardUseCase>(
			TYPES.UseCases.GetRestaurantAnalyticsDashboardUseCase,
		);
		expect(useCase).toBeInstanceOf(GetRestaurantAnalyticsDashboardUseCase);
	});

	it("7. should resolve AdminDashboardAnalyticsController via TYPES.Controller token", () => {
		const controller = container.get<AdminDashboardAnalyticsController>(
			TYPES.Controller.AdminDashboardAnalyticsController,
		);
		expect(controller).toBeInstanceOf(AdminDashboardAnalyticsController);
	});

	it("8. should resolve RestaurantAnalyticsController via TYPES.Controller token", () => {
		const controller = container.get<RestaurantAnalyticsController>(
			TYPES.Controller.RestaurantAnalyticsController,
		);
		expect(controller).toBeInstanceOf(RestaurantAnalyticsController);
	});

	it("9. should resolve adminDashboardAnalyticsController via controllers.resolutions", () => {
		expect(adminDashboardAnalyticsController).toBeInstanceOf(
			AdminDashboardAnalyticsController,
		);
	});

	it("10. should resolve restaurantAnalyticsController via controllers.resolutions", () => {
		expect(restaurantAnalyticsController).toBeInstanceOf(
			RestaurantAnalyticsController,
		);
	});
});
