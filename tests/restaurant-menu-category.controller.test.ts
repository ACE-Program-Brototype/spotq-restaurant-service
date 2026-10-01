import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";
import { errorHandler } from "@/presentation/http/middleware/error.middleware.ts";
import { ERROR_CODES } from "@/shared/constants/error-code.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("POST /restaurants/:restaurantId/menu/categories - Integration & Controller Suite", () => {
	let mockRestaurantRepo: {
		findById: jest.Mock;
	};
	let mockMenuCategoryRepo: {
		findByNameAndRestaurantId: jest.Mock;
		getNextDisplayOrder: jest.Mock;
		create: jest.Mock;
	};

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const authHeaders = {
		"x-user-id": "user-owner-1",
		"x-restaurant-id": restaurantId,
		"x-user-role": "restaurant_owner",
		"x-user-email": "owner@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		};

		mockMenuCategoryRepo = {
			findByNameAndRestaurantId: jest.fn(),
			getNextDisplayOrder: jest.fn(),
			create: jest.fn(),
		};
	});

	it("should return 401 UNAUTHORIZED when no authentication identity header is provided", async () => {
		const req = {
			method: "POST",
			url: `/${restaurantId}/menu/categories`,
			headers: { "content-type": "application/json" },
			params: { restaurantId },
			body: { name: "Starters" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "UNAUTHORIZED",
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 FORBIDDEN when user attempts cross-restaurant creation", async () => {
		const req = {
			method: "POST",
			url: `/${restaurantId}/menu/categories`,
			headers: {
				...authHeaders,
				"x-restaurant-id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", // different restaurant
			},
			params: { restaurantId },
			body: { name: "Starters" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});

	it("should return 422 UNPROCESSABLE ENTITY when restaurantId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId: "not-a-valid-uuid" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const { validateRequestParams } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { createMenuCategoryParamsSchema } = await import(
			"@/presentation/http/validators/create-menu-category.validator.ts"
		);

		const middleware = validateRequestParams(createMenuCategoryParamsSchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE ENTITY when category name is missing or whitespace-only", async () => {
		const req = {
			body: { name: "   " },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		const { validateRequestBody } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { createMenuCategoryBodySchema } = await import(
			"@/presentation/http/validators/create-menu-category.validator.ts"
		);

		const middleware = validateRequestBody(createMenuCategoryBodySchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.VALIDATION_ERROR,
				statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId },
			body: { name: "Main Course" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const useCase = new CreateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(useCase, {} as never);

		try {
			await controller.createCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.RESTAURANT_NOT_FOUND,
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 409 CONFLICT when category name already exists for the restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });

		const existing = MenuCategory.create({
			restaurantId,
			name: "Starters",
		});
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(
			existing,
		);

		const req = {
			params: { restaurantId },
			body: { name: "Starters" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const useCase = new CreateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(useCase, {} as never);

		try {
			await controller.createCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_ALREADY_EXISTS",
				statusCode: HTTP_STATUS.CONFLICT,
			}),
		);
	});

	it("should return 201 CREATED with the complete category entity on success", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(null);
		mockMenuCategoryRepo.getNextDisplayOrder.mockResolvedValueOnce(0);

		mockMenuCategoryRepo.create.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const req = {
			params: { restaurantId },
			body: {
				name: "Beverages",
				description: "Cold and hot drinks",
			},
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const useCase = new CreateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(useCase, {} as never);

		await controller.createCategory(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_CREATED_SUCCESS,
				statusCode: HTTP_STATUS.CREATED,
				data: expect.objectContaining({
					restaurantId,
					name: "Beverages",
					description: "Cold and hot drinks",
					displayOrder: 0,
					isActive: true,
				}),
			}),
		);
	});
});

describe("PATCH /restaurants/:restaurantId/menu/categories/:categoryId - Integration & Controller Suite", () => {
	let mockRestaurantRepo: {
		findById: jest.Mock;
	};
	let mockMenuCategoryRepo: {
		findById: jest.Mock;
		findByNameAndRestaurantId: jest.Mock;
		updateCategory: jest.Mock;
	};

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const authHeaders = {
		"x-user-id": "user-owner-1",
		"x-restaurant-id": restaurantId,
		"x-user-role": "restaurant_owner",
		"x-user-email": "owner@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		};

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			updateCategory: jest.fn(),
		};
	});

	it("should return 401 UNAUTHORIZED when no authentication identity header is provided", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/categories/${categoryId}`,
			headers: { "content-type": "application/json" },
			params: { restaurantId, categoryId },
			body: { name: "Updated Starters" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "UNAUTHORIZED",
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 FORBIDDEN when user attempts cross-restaurant update", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/categories/${categoryId}`,
			headers: {
				...authHeaders,
				"x-restaurant-id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", // different restaurant
			},
			params: { restaurantId, categoryId },
			body: { name: "Updated Starters" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});

	it("should return 422 UNPROCESSABLE ENTITY when categoryId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId, categoryId: "not-a-valid-uuid" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const { validateRequestParams } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryParamsSchema } = await import(
			"@/presentation/http/validators/update-menu-category.validator.ts"
		);

		const middleware = validateRequestParams(updateMenuCategoryParamsSchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE ENTITY when body is empty {}", async () => {
		const req = {
			body: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		const { validateRequestBody } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryBodySchema } = await import(
			"@/presentation/http/validators/update-menu-category.validator.ts"
		);

		const middleware = validateRequestBody(updateMenuCategoryBodySchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.VALIDATION_ERROR,
				statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			body: { name: "Updated Starters" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryUseCase } = await import(
			"@/application/use-cases/update-menu-category.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		try {
			await controller.updateCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.RESTAURANT_NOT_FOUND,
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			body: { name: "Updated Starters" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryUseCase } = await import(
			"@/application/use-cases/update-menu-category.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		try {
			await controller.updateCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category belongs to another restaurant (data isolation)", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const otherCategory = MenuCategory.create({
			id: categoryId,
			restaurantId: "other-restaurant-id",
			name: "Starters",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(otherCategory);

		const req = {
			params: { restaurantId, categoryId },
			body: { name: "Updated Starters" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryUseCase } = await import(
			"@/application/use-cases/update-menu-category.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		try {
			await controller.updateCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 409 CONFLICT when updated name already exists in the same restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const currentCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Starters",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(currentCategory);

		const duplicateCategory = MenuCategory.create({
			id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
			restaurantId,
			name: "Main Course",
		});
		mockMenuCategoryRepo.findByNameAndRestaurantId.mockResolvedValueOnce(
			duplicateCategory,
		);

		const req = {
			params: { restaurantId, categoryId },
			body: { name: "Main Course" },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryUseCase } = await import(
			"@/application/use-cases/update-menu-category.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		try {
			await controller.updateCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_ALREADY_EXISTS",
				statusCode: HTTP_STATUS.CONFLICT,
			}),
		);
	});

	it("should return 200 OK with the fully updated category object on success", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const currentCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Main Courses",
			description: "Old description",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(currentCategory);
		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const req = {
			params: { restaurantId, categoryId },
			body: {
				name: "Main Courses",
				description: "Main dishes and meals",
				displayOrder: 2,
				isActive: true,
			},
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const { UpdateMenuCategoryUseCase } = await import(
			"@/application/use-cases/update-menu-category.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController({} as never, useCase);

		await controller.updateCategory(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_UPDATED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: expect.objectContaining({
					id: categoryId,
					restaurantId,
					name: "Main Courses",
					description: "Main dishes and meals",
					displayOrder: 2,
					isActive: true,
				}),
			}),
		);
	});
});

describe("DELETE /restaurants/:restaurantId/menu/categories/:categoryId - Integration & Controller Suite", () => {
	let mockRestaurantRepo: {
		findById: jest.Mock;
	};
	let mockMenuCategoryRepo: {
		findById: jest.Mock;
		updateCategory: jest.Mock;
		hasMenuItems: jest.Mock;
	};

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const authHeaders = {
		"x-user-id": "user-owner-1",
		"x-restaurant-id": restaurantId,
		"x-user-role": "restaurant_owner",
		"x-user-email": "owner@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		};

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			updateCategory: jest.fn(),
			hasMenuItems: jest.fn(),
		};
	});

	it("should return 401 UNAUTHORIZED when no authentication identity header is provided", async () => {
		const req = {
			method: "DELETE",
			url: `/${restaurantId}/menu/categories/${categoryId}`,
			params: { restaurantId, categoryId },
			headers: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "UNAUTHORIZED",
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 FORBIDDEN when user attempts cross-restaurant deletion", async () => {
		const req = {
			method: "DELETE",
			url: `/${restaurantId}/menu/categories/${categoryId}`,
			headers: {
				...authHeaders,
				"x-restaurant-id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", // different restaurant
			},
			params: { restaurantId, categoryId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});

	it("should return 422 UNPROCESSABLE ENTITY when categoryId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId, categoryId: "not-a-valid-uuid" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const { validateRequestParams } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { deleteMenuCategoryParamsSchema } = await import(
			"@/presentation/http/validators/delete-menu-category.validator.ts"
		);

		const middleware = validateRequestParams(deleteMenuCategoryParamsSchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.deleteCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.RESTAURANT_NOT_FOUND,
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.deleteCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category belongs to another restaurant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const foreignCategory = MenuCategory.create({
			id: categoryId,
			restaurantId: "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
			name: "Foreign Specials",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(foreignCategory);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.deleteCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category is already soft-deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const deletedCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Deleted Category",
			description: null,
			displayOrder: 0,
			isActive: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(deletedCategory);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.deleteCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 409 CONFLICT when category has assigned menu items", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Starters",
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);
		mockMenuCategoryRepo.hasMenuItems.mockResolvedValueOnce(true);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.deleteCategory(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_HAS_MENU_ITEMS",
				message: messages.CATEGORY_HAS_MENU_ITEMS,
				statusCode: HTTP_STATUS.CONFLICT,
			}),
		);
	});

	it("should return 200 OK with success message when category is successfully deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const existingCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Seasonal Drinks",
			displayOrder: 3,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(existingCategory);
		mockMenuCategoryRepo.hasMenuItems.mockResolvedValueOnce(false);
		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const req = {
			params: { restaurantId, categoryId },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const { DeleteMenuCategoryUseCase } = await import(
			"@/application/use-cases/delete-menu-category.use-case.ts"
		);
		const useCase = new DeleteMenuCategoryUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			useCase,
		);

		await controller.deleteCategory(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_DELETED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: null,
			}),
		);
		expect(existingCategory.isDeleted).toBe(true);
		expect(existingCategory.isActive).toBe(false);
	});
});

describe("PATCH /restaurants/:restaurantId/menu/categories/:categoryId/status - Integration & Controller Suite", () => {
	let mockRestaurantRepo: {
		findById: jest.Mock;
	};
	let mockMenuCategoryRepo: {
		findById: jest.Mock;
		updateCategory: jest.Mock;
	};

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const authHeaders = {
		"x-user-id": "user-owner-1",
		"x-restaurant-id": restaurantId,
		"x-user-role": "restaurant_owner",
		"x-user-email": "owner@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		};

		mockMenuCategoryRepo = {
			findById: jest.fn(),
			updateCategory: jest.fn(),
		};
	});

	it("should return 401 UNAUTHORIZED when no authentication identity header is provided", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/categories/${categoryId}/status`,
			headers: { "content-type": "application/json" },
			params: { restaurantId, categoryId },
			body: { isActive: false },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "UNAUTHORIZED",
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 FORBIDDEN when user attempts cross-restaurant status update", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/categories/${categoryId}/status`,
			headers: {
				...authHeaders,
				"x-restaurant-id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", // different restaurant
			},
			params: { restaurantId, categoryId },
			body: { isActive: false },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const next = jest.fn();

		const { restaurantOwnerAuthMiddleware } = await import(
			"@/presentation/http/middleware/restaurant-owner.auth.middleware.ts"
		);

		restaurantOwnerAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});

	it("should return 422 UNPROCESSABLE ENTITY when restaurantId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId: "not-a-valid-uuid", categoryId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const { validateRequestParams } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryStatusParamsSchema } = await import(
			"@/presentation/http/validators/update-menu-category-status.validator.ts"
		);

		const middleware = validateRequestParams(
			updateMenuCategoryStatusParamsSchema,
		);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE ENTITY when categoryId param is not a valid UUID", async () => {
		const req = {
			params: { restaurantId, categoryId: "not-a-valid-uuid" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};
		const next = jest.fn();

		const { validateRequestParams } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryStatusParamsSchema } = await import(
			"@/presentation/http/validators/update-menu-category-status.validator.ts"
		);

		const middleware = validateRequestParams(
			updateMenuCategoryStatusParamsSchema,
		);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE ENTITY when isActive is missing from body", async () => {
		const req = {
			body: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		const { validateRequestBody } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryStatusBodySchema } = await import(
			"@/presentation/http/validators/update-menu-category-status.validator.ts"
		);

		const middleware = validateRequestBody(updateMenuCategoryStatusBodySchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.VALIDATION_ERROR,
				statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE ENTITY when isActive is not a boolean", async () => {
		const req = {
			body: { isActive: "not-a-boolean" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		const { validateRequestBody } = await import(
			"@/presentation/http/middleware/validation.middleware.ts"
		);
		const { updateMenuCategoryStatusBodySchema } = await import(
			"@/presentation/http/validators/update-menu-category-status.validator.ts"
		);

		const middleware = validateRequestBody(updateMenuCategoryStatusBodySchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: false },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.updateCategoryStatus(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: ERROR_CODES.RESTAURANT_NOT_FOUND,
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: false },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.updateCategoryStatus(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category belongs to another restaurant (data isolation)", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const otherCategory = MenuCategory.create({
			id: categoryId,
			restaurantId: "other-restaurant-id",
			name: "Breakfast",
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(otherCategory);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: false },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.updateCategoryStatus(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 404 NOT FOUND when category is soft-deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const deletedCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			description: null,
			displayOrder: 0,
			isActive: false,
			isDeleted: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(deletedCategory);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: true },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.updateCategoryStatus(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "CATEGORY_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 200 OK and successfully deactivate category", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const currentCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			description: "Morning dishes",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(currentCategory);
		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: false },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		await controller.updateCategoryStatus(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_STATUS_UPDATED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: expect.objectContaining({
					id: categoryId,
					restaurantId,
					name: "Breakfast",
					isActive: false,
				}),
			}),
		);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should return 200 OK and successfully activate category", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const currentCategory = MenuCategory.reconstitute({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			description: "Morning dishes",
			displayOrder: 1,
			isActive: false,
			isDeleted: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(currentCategory);
		mockMenuCategoryRepo.updateCategory.mockImplementationOnce(
			async (entity: MenuCategory) => entity,
		);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: true },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		await controller.updateCategoryStatus(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_STATUS_UPDATED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: expect.objectContaining({
					id: categoryId,
					restaurantId,
					name: "Breakfast",
					isActive: true,
				}),
			}),
		);
		expect(mockMenuCategoryRepo.updateCategory).toHaveBeenCalledTimes(1);
	});

	it("should return 200 OK and be idempotent without calling DB write when status is already matching", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({ id: restaurantId });
		const currentCategory = MenuCategory.create({
			id: categoryId,
			restaurantId,
			name: "Breakfast",
			description: "Morning dishes",
			displayOrder: 1,
			isActive: true,
		});
		mockMenuCategoryRepo.findById.mockResolvedValueOnce(currentCategory);

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: true },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		await controller.updateCategoryStatus(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.MENU_CATEGORY_STATUS_UPDATED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: expect.objectContaining({
					id: categoryId,
					restaurantId,
					name: "Breakfast",
					isActive: true,
				}),
			}),
		);
		expect(mockMenuCategoryRepo.updateCategory).not.toHaveBeenCalled();
	});

	it("should return 403 FORBIDDEN when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		});

		const req = {
			params: { restaurantId, categoryId },
			body: { isActive: true },
			user: authHeaders,
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: { requestId: "req-1", correlationId: "corr-1" },
		};

		const { UpdateMenuCategoryStatusUseCase } = await import(
			"@/application/use-cases/update-menu-category-status.use-case.ts"
		);
		const useCase = new UpdateMenuCategoryStatusUseCase(
			mockRestaurantRepo as never,
			mockMenuCategoryRepo as never,
		);
		const controller = new MenuCategoryController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);

		try {
			await controller.updateCategoryStatus(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "RESTAURANT_ACCOUNT_BLOCKED",
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});
});

