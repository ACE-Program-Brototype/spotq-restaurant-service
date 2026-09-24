import { ListRestaurantMenuCategoriesUseCase } from "@/application/use-cases/list-restaurant-menu-categories.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";
import { adminAuthMiddleware } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import { errorHandler } from "@/presentation/http/middleware/error.middleware.ts";
import { validateRequestParams } from "@/presentation/http/middleware/validation.middleware.ts";
import { listMenuCategoriesParamSchema } from "@/presentation/http/validators/admin/list-menu-categories.validator.ts";
import { ERROR_CODES } from "@/shared/constants/error-code.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("GET /admin/restaurants/:restaurantId/menu/categories - Integration & Controller Suite", () => {
	let mockRestaurantRepo: {
		findById: jest.Mock;
	};
	let mockMenuCategoryRepo: {
		findByRestaurantId: jest.Mock;
	};

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const adminAuthHeaders = {
		"x-user-id": "admin-user-01",
		"x-user-role": "admin",
		"x-user-email": "admin@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		};

		mockMenuCategoryRepo = {
			findByRestaurantId: jest.fn(),
		};
	});

	it("should return 401 UNAUTHORIZED when no authentication identity header is provided", async () => {
		const req = {
			method: "GET",
			url: `/admin/restaurants/${restaurantId}/menu/categories`,
			headers: {},
			params: { restaurantId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		adminAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "UNAUTHORIZED",
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 403 FORBIDDEN when user lacks platform admin role", async () => {
		const req = {
			method: "GET",
			url: `/admin/restaurants/${restaurantId}/menu/categories`,
			headers: {
				"x-user-id": "regular-user-01",
				"x-user-role": "customer",
				"x-user-email": "customer@spotq.com",
			},
			params: { restaurantId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		adminAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "FORBIDDEN",
				message: messages.ADMIN_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 400 BAD REQUEST when restaurantId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId: "invalid-uuid-format" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const middleware = validateRequestParams(
			listMenuCategoriesParamSchema,
			HTTP_STATUS.BAD_REQUEST,
		);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "VALIDATION_ERROR",
				statusCode: HTTP_STATUS.BAD_REQUEST,
				error: expect.arrayContaining([
					expect.objectContaining({
						field: "restaurantId",
						message: messages.INVALID_RESTAURANT_ID_FORMAT,
					}),
				]),
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId },
			user: adminAuthHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-admin-1", correlationId: "corr-admin-1" },
		};

		const useCase = new ListRestaurantMenuCategoriesUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		const next = (error: unknown) => {
			errorHandler(error as never, req as never, res as never, jest.fn());
		};

		await controller.listRestaurantCategories(
			req as never,
			res as never,
			next,
		);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.RESTAURANT_NOT_FOUND,
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 200 OK with populated categories sorted by displayOrder ASC and internal fields stripped", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);

		const category1 = MenuCategory.reconstitute({
			id: "cat-1",
			restaurantId,
			name: "Beverages",
			description: "Cold and hot drinks",
			displayOrder: 0,
			isActive: true,
			createdAt: new Date("2026-09-24T10:00:00Z"),
			updatedAt: new Date("2026-09-24T10:00:00Z"),
		});

		const category2 = MenuCategory.reconstitute({
			id: "cat-2",
			restaurantId,
			name: "Main Course",
			description: null,
			displayOrder: 1,
			isActive: false,
			createdAt: new Date("2026-09-24T11:00:00Z"),
			updatedAt: new Date("2026-09-24T11:00:00Z"),
		});

		mockMenuCategoryRepo.findByRestaurantId.mockResolvedValueOnce([
			category1,
			category2,
		]);

		const req = {
			params: { restaurantId },
			user: adminAuthHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const useCase = new ListRestaurantMenuCategoriesUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		await controller.listRestaurantCategories(
			req as never,
			res as never,
			next,
		);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			message: messages.MENU_CATEGORIES_FETCHED_SUCCESS,
			statusCode: HTTP_STATUS.OK,
			data: {
				restaurantId,
				categories: [
					{
						id: "cat-1",
						name: "Beverages",
						description: "Cold and hot drinks",
						isActive: true,
						displayOrder: 0,
					},
					{
						id: "cat-2",
						name: "Main Course",
						description: null,
						isActive: false,
						displayOrder: 1,
					},
				],
			},
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 200 OK with empty categories array when restaurant has zero configured categories", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as Restaurant);
		mockMenuCategoryRepo.findByRestaurantId.mockResolvedValueOnce([]);

		const req = {
			params: { restaurantId },
			user: adminAuthHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const useCase = new ListRestaurantMenuCategoriesUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		await controller.listRestaurantCategories(
			req as never,
			res as never,
			next,
		);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith({
			success: true,
			message: messages.MENU_CATEGORIES_FETCHED_SUCCESS,
			statusCode: HTTP_STATUS.OK,
			data: {
				restaurantId,
				categories: [],
			},
		});
		expect(next).not.toHaveBeenCalled();
	});
});
