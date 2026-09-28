import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListMenuItemsUseCase } from "@/application/use-cases/list-menu-items.use-case.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { restaurantOwnerAuthMiddleware } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import {
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	listMenuItemsParamsSchema,
	listMenuItemsQuerySchema,
} from "@/presentation/http/validators/list-menu-items.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

describe("GET /:restaurantId/menu/items - Route Level & Query Transformation Suite", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let controller: MenuItemController;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01";

	const authHeaders = {
		"x-user-id": restaurantId,
		"x-restaurant-id": restaurantId,
		"x-user-role": "restaurant_owner",
		"x-user-email": "owner@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findManyWithFiltersAndStats: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			getRestaurantMenuStats: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		const useCase = new ListMenuItemsUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);
		controller = new MenuItemController(useCase);
	});

	it("should transform snake_case aliases and boolean strings through validation middleware and execute repository with mapped values", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as never);

		mockMenuItemRepo.findManyWithFiltersAndStats.mockResolvedValueOnce({
			items: [],
			total: 0,
			stats: {
				totalCategories: 1,
				totalMenuItems: 0,
				availableItems: 0,
				outOfStockItems: 0,
			},
		});

		const req = {
			method: "GET",
			url: `/${restaurantId}/menu/items`,
			headers: authHeaders,
			params: { restaurantId },
			query: {
				page: "2",
				limit: "15",
				search: "wagyu burger",
				category_id: categoryId,
				status: "available",
				min_price: "12.50",
				max_price: "45.00",
				is_vegetarian: "true",
				is_featured: "false",
				sort_by: "preparation_time",
				sort_order: "asc",
			},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {} as Record<string, unknown>,
		};

		// 1. Auth middleware
		const nextAuth = jest.fn();
		restaurantOwnerAuthMiddleware(req as never, res as never, nextAuth);
		expect(nextAuth).toHaveBeenCalled();

		// 2. Params validation middleware
		const paramsMiddleware = validateRequestParams(listMenuItemsParamsSchema);
		const nextParams = jest.fn();
		await paramsMiddleware(req as never, res as never, nextParams);
		expect(nextParams).toHaveBeenCalled();

		// 3. Query validation middleware (stores transformed query in res.locals.query)
		const queryMiddleware = validateRequestQuery(listMenuItemsQuerySchema);
		const nextQuery = jest.fn();
		await queryMiddleware(req as never, res as never, nextQuery);
		expect(nextQuery).toHaveBeenCalled();

		// 4. Controller handles the request using res.locals.query
		await controller.listMenuItems(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(mockMenuItemRepo.findManyWithFiltersAndStats).toHaveBeenCalledWith({
			restaurantId,
			page: 2,
			limit: 15,
			search: "wagyu burger",
			categoryId,
			isAvailable: true,
			isVegetarian: true,
			isFeatured: false,
			minPrice: 12.5,
			maxPrice: 45.0,
			sortBy: "preparationTime",
			sortOrder: "asc",
		});
	});

	it("should reject invalid query with 422 when minPrice > maxPrice", async () => {
		const req = {
			method: "GET",
			url: `/${restaurantId}/menu/items`,
			headers: authHeaders,
			params: { restaurantId },
			query: {
				min_price: "50",
				max_price: "20",
			},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const queryMiddleware = validateRequestQuery(listMenuItemsQuerySchema);
		const nextQuery = jest.fn();
		await queryMiddleware(req as never, res as never, nextQuery);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextQuery).not.toHaveBeenCalled();
	});
});
