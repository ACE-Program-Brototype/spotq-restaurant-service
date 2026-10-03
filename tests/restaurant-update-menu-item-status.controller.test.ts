import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuItemStatusUseCase } from "@/application/use-cases/update-menu-item-status.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import {
	validateRequestBody,
	validateRequestParams,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	updateMenuItemStatusBodySchema,
	updateMenuItemStatusParamsSchema,
} from "@/presentation/http/validators/update-menu-item-status.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("PATCH /:restaurantId/menu/items/:menuItemId/status - Route & Acceptance Tests", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let controller: MenuItemController;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const menuItemId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01";

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findById: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			updateAvailability: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		const updateStatusUseCase = new UpdateMenuItemStatusUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);

		controller = new MenuItemController(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			updateStatusUseCase,
		);
	});

	it("should return 200 with updated menu item and variant status when isAvailable is set to false", async () => {
		const now = new Date();
		const domainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId: "cat-1",
			name: "Classic Cheeseburger",
			description: "Juicy beef patty with aged cheddar",
			price: 14.5,
			preparationTime: 20,
			calories: 680,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			createdAt: now,
			updatedAt: now,
		});

		const domainVariant = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId,
			sku: "BURGER-MED",
			name: "Medium",
			price: 14.5,
			isDefault: true,
			isAvailable: false,
			createdAt: now,
			updatedAt: now,
		});

		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as never);

		mockMenuItemRepo.findById.mockResolvedValueOnce(domainItem);
		mockMenuItemRepo.updateAvailability.mockImplementationOnce(
			async (entity: MenuItem) => entity,
		);

		const updatedDomainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId: "cat-1",
			name: "Classic Cheeseburger",
			description: "Juicy beef patty with aged cheddar",
			price: 14.5,
			preparationTime: 20,
			calories: 680,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: false,
			isDeleted: false,
			createdAt: now,
			updatedAt: now,
		});

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: updatedDomainItem,
			category: {
				id: "cat-1",
				name: "Burgers & Sandwiches",
				description: "Handcrafted gourmet burgers",
				isActive: true,
			},
			images: [],
			variants: [domainVariant],
			addons: [],
		});

		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/items/${menuItemId}/status`,
			params: { restaurantId, menuItemId },
			body: { isAvailable: false },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {} as Record<string, unknown>,
		};

		const paramsMiddleware = validateRequestParams(
			updateMenuItemStatusParamsSchema,
		);
		const bodyMiddleware = validateRequestBody(updateMenuItemStatusBodySchema);
		const nextParams = jest.fn();
		const nextBody = jest.fn();

		await paramsMiddleware(req as never, res as never, nextParams);
		expect(nextParams).toHaveBeenCalled();

		await bodyMiddleware(req as never, res as never, nextBody);
		expect(nextBody).toHaveBeenCalled();

		await controller.updateMenuItemStatus(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: HTTP_STATUS.OK,
				message: messages.MENU_ITEM_STATUS_UPDATED_SUCCESS,
				data: expect.objectContaining({
					id: menuItemId,
					isAvailable: false,
					variants: [
						expect.objectContaining({
							id: "var-1",
							isAvailable: false,
						}),
					],
				}),
			}),
		);
	});

	it("should reject with 422 when restaurantId or menuItemId is invalid UUID", async () => {
		const req = {
			method: "PATCH",
			url: `/invalid-uuid/menu/items/not-a-uuid/status`,
			params: {
				restaurantId: "invalid-uuid",
				menuItemId: "not-a-uuid",
			},
			body: { isAvailable: false },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const paramsMiddleware = validateRequestParams(
			updateMenuItemStatusParamsSchema,
		);
		const nextParams = jest.fn();
		await paramsMiddleware(req as never, res as never, nextParams);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextParams).not.toHaveBeenCalled();
	});

	it("should reject with 422 when body does not contain valid boolean isAvailable", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/items/${menuItemId}/status`,
			params: { restaurantId, menuItemId },
			body: { isAvailable: "not-a-boolean" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const bodyMiddleware = validateRequestBody(updateMenuItemStatusBodySchema);
		const nextBody = jest.fn();
		await bodyMiddleware(req as never, res as never, nextBody);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextBody).not.toHaveBeenCalled();
	});
});
