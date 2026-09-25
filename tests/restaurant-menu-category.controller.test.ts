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
		const controller = new MenuCategoryController(useCase);

		const next = (error: unknown) => {
			errorHandler(error as never, req as never, res as never, jest.fn());
		};

		await controller.createCategory(req as never, res as never, next);

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
		const controller = new MenuCategoryController(useCase);

		const next = (error: unknown) => {
			errorHandler(error as never, req as never, res as never, jest.fn());
		};

		await controller.createCategory(req as never, res as never, next);

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
		const controller = new MenuCategoryController(useCase);
		const next = jest.fn();

		await controller.createCategory(req as never, res as never, next);

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
		expect(next).not.toHaveBeenCalled();
	});
});
