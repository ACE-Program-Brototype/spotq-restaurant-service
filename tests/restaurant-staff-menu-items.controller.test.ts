import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { ListStaffMenuItemsUseCase } from "@/application/use-cases/list-staff-menu-items.use-case.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { errorHandler } from "@/presentation/http/middleware/error.middleware.ts";
import {
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	listStaffMenuItemsParamsSchema,
	listStaffMenuItemsQuerySchema,
} from "@/presentation/http/validators/list-staff-menu-items.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { staffAuthMiddleware } from "@presentation/http/middleware/staff.auth.middleware";

describe("GET /restaurants/:restaurantId/staff/menu/items - Integration & Controller Suite", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let controller: MenuItemController;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	const staffHeaders = {
		"x-user-id": "staff-user-1",
		"x-restaurant-id": restaurantId,
		"x-user-role": "staff",
		"x-user-email": "staff@spotq.com",
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findManyStaffMenuItems: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		const useCase = new ListStaffMenuItemsUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);

		controller = new MenuItemController(
			{} as never,
			{} as never,
			{} as never,
			useCase,
		);
	});

	it("should return 401 UNAUTHORIZED when no identity headers are present", () => {
		const req = {
			method: "GET",
			url: `/${restaurantId}/staff/menu/items`,
			headers: { "x-user-role": "staff" },
			params: { restaurantId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		staffAuthMiddleware(req as never, res as never, next);

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

	it("should return 403 FORBIDDEN when user role is not staff", () => {
		const req = {
			method: "GET",
			url: `/${restaurantId}/staff/menu/items`,
			headers: {
				...staffHeaders,
				"x-user-role": "customer",
			},
			params: { restaurantId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		staffAuthMiddleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.STAFF_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 422 UNPROCESSABLE_ENTITY when restaurantId param is invalid UUID", async () => {
		const req = {
			params: { restaurantId: "invalid-uuid" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
		};
		const next = jest.fn();

		const middleware = validateRequestParams(listStaffMenuItemsParamsSchema);
		await middleware(req as never, res as never, next);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 404 NOT FOUND when target restaurant does not exist in DB", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		const req = {
			params: { restaurantId },
			headers: staffHeaders,
			query: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		staffAuthMiddleware(req as never, res as never, jest.fn());

		try {
			await controller.listStaffMenuItems(req as never, res as never);
		} catch (error) {
			errorHandler(error as never, req as never, res as never, jest.fn());
		}

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				code: "RESTAURANT_NOT_FOUND",
				statusCode: HTTP_STATUS.NOT_FOUND,
			}),
		);
	});

	it("should return 403 FORBIDDEN when restaurant account is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		} as never);

		const req = {
			params: { restaurantId },
			headers: staffHeaders,
			query: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		staffAuthMiddleware(req as never, res as never, jest.fn());

		try {
			await controller.listStaffMenuItems(req as never, res as never);
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

	it("should successfully retrieve staff menu items with 200 OK and expected payload structure", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		const now = new Date("2026-09-21T13:00:00Z");

		mockMenuItemRepo.findManyStaffMenuItems.mockResolvedValueOnce({
			items: [
				{
					id: "item-001",
					name: "Pepperoni Pizza",
					sku: "PIZ-PEP",
					description: "Classic tomato base, mozzarella, and spicy pepperoni",
					basePrice: 12.5,
					categoryId,
					categoryName: "Pizzas",
					categoryDisplayOrder: 1,
					categoryIsActive: true,
					isAvailable: true,
					unavailabilityReason: null,
					autoResetAt: null,
					variantCount: 3,
					hasVariants: true,
					variants: [
						{
							id: "var-101",
							name: 'Small (10")',
							sku: "PIZ-PEP-SM",
							price: 12.5,
							isDefault: true,
							isAvailable: true,
						},
						{
							id: "var-102",
							name: 'Medium (12")',
							sku: "PIZ-PEP-MD",
							price: 16.0,
							isDefault: false,
							isAvailable: true,
						},
						{
							id: "var-103",
							name: 'Large (16")',
							sku: "PIZ-PEP-LG",
							price: 20.0,
							isDefault: false,
							isAvailable: false,
						},
					],
					createdAt: now,
					updatedAt: now,
				},
				{
					id: "item-002",
					name: "Truffle Fries",
					sku: "APP-TRF",
					description: "Crispy fries tossed with Italian truffle oil",
					basePrice: 7.5,
					categoryId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
					categoryName: "Starters",
					categoryDisplayOrder: 3,
					categoryIsActive: true,
					isAvailable: false,
					unavailabilityReason: null,
					autoResetAt: null,
					variantCount: 0,
					hasVariants: false,
					variants: [],
					createdAt: now,
					updatedAt: now,
				},
			],
			total: 2,
		});

		const req = {
			method: "GET",
			url: `/${restaurantId}/staff/menu/items`,
			headers: staffHeaders,
			params: { restaurantId },
			query: {
				page: "1",
				limit: "50",
				search: "Pizza",
				category_id: categoryId,
				is_available: "true",
				include_variants: "true",
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
		staffAuthMiddleware(req as never, res as never, nextAuth);
		expect(nextAuth).toHaveBeenCalled();

		// 2. Params validator
		const nextParams = jest.fn();
		await validateRequestParams(listStaffMenuItemsParamsSchema)(
			req as never,
			res as never,
			nextParams,
		);
		expect(nextParams).toHaveBeenCalled();

		// 3. Query validator
		const nextQuery = jest.fn();
		await validateRequestQuery(listStaffMenuItemsQuerySchema)(
			req as never,
			res as never,
			nextQuery,
		);
		expect(nextQuery).toHaveBeenCalled();

		// 4. Controller execution
		await controller.listStaffMenuItems(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: messages.STAFF_MENU_ITEMS_FETCHED_SUCCESS,
				statusCode: HTTP_STATUS.OK,
				data: expect.objectContaining({
					restaurantId,
					page: 1,
					limit: 50,
					totalCount: 2,
					totalPages: 1,
					items: expect.arrayContaining([
						expect.objectContaining({
							id: "item-001",
							name: "Pepperoni Pizza",
							sku: "PIZ-PEP",
							basePrice: 12.5,
							categoryId,
							categoryName: "Pizzas",
							displayOrder: 1,
							isActive: true,
							isAvailable: true,
							variantCount: 3,
							hasVariants: true,
							variants: expect.arrayContaining([
								expect.objectContaining({
									id: "var-101",
									name: 'Small (10")',
									price: 12.5,
								}),
							]),
						}),
						expect.objectContaining({
							id: "item-002",
							name: "Truffle Fries",
							sku: "APP-TRF",
							basePrice: 7.5,
							variantCount: 0,
							hasVariants: false,
							variants: [],
						}),
					]),
				}),
			}),
		);
	});

	it("should filter 86'd items correctly when isAvailable=false is passed", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		mockMenuItemRepo.findManyStaffMenuItems.mockResolvedValueOnce({
			items: [],
			total: 0,
		});

		const req = {
			method: "GET",
			url: `/${restaurantId}/staff/menu/items`,
			headers: staffHeaders,
			params: { restaurantId },
			query: {
				status: "out_of_stock",
			},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {} as Record<string, unknown>,
		};

		staffAuthMiddleware(req as never, res as never, jest.fn());
		await validateRequestParams(listStaffMenuItemsParamsSchema)(
			req as never,
			res as never,
			jest.fn(),
		);
		await validateRequestQuery(listStaffMenuItemsQuerySchema)(
			req as never,
			res as never,
			jest.fn(),
		);

		await controller.listStaffMenuItems(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(mockMenuItemRepo.findManyStaffMenuItems).toHaveBeenCalledWith(
			expect.objectContaining({
				restaurantId,
				isAvailable: false,
			}),
		);
	});
});
