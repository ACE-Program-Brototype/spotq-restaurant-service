import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IAddonRepository } from "@/application/ports/repositories/addon.repository.port.ts";
import type { IMenuCategoryRepository } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { UpdateMenuItemUseCase } from "@/application/use-cases/update-menu-item.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import {
	validateRequestBody,
	validateRequestParams,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	updateMenuItemBodySchema,
	updateMenuItemParamsSchema,
} from "@/presentation/http/validators/update-menu-item.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("PUT & PATCH /:restaurantId/menu/items/:menuItemId - Route & Integration Tests", () => {
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let mockMenuCategoryRepo: jest.Mocked<IMenuCategoryRepository>;
	let mockAddonRepo: jest.Mocked<IAddonRepository>;
	let controller: MenuItemController;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const menuItemId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01";
	const categoryId = "c1eebc99-9c0b-4ef8-bb6d-6bb9bd380d01";
	const addonId = "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380e01";
	const variantId1 = "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380f01";
	const variantId2 = "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380f02";

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findById: jest.fn(),
			findByIdAndRestaurantId: jest.fn(),
			findByNameAndRestaurantId: jest.fn(),
			updateWithDetails: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		mockMenuCategoryRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IMenuCategoryRepository>;

		mockAddonRepo = {
			findByIdsAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IAddonRepository>;

		const updateMenuItemUseCase = new UpdateMenuItemUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
			mockMenuCategoryRepo,
			mockAddonRepo,
		);

		controller = new MenuItemController(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			updateMenuItemUseCase,
		);
	});

	it("should return 200 with updated menu item details when updating variants and removing unused ones", async () => {
		const now = new Date();
		const domainItem = MenuItem.reconstitute({
			id: menuItemId,
			restaurantId,
			categoryId,
			name: "Hyderabadi Biryani",
			description: "Authentic dum style biryani",
			price: 300,
			preparationTime: 25,
			calories: 750,
			isVegetarian: false,
			isFeatured: true,
			isAvailable: true,
			isDeleted: false,
			createdAt: now,
			updatedAt: now,
		});

		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
		} as never);

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: domainItem,
			category: { id: categoryId, name: "Biryani", description: null, isActive: true },
			images: [{ id: "img-1", menuItemId, objectKey: "menu/img1.png", displayOrder: 0, createdAt: now }],
			variants: [
				MenuItemVariant.reconstitute({
					id: variantId1,
					menuItemId,
					sku: "HYD-HALF",
					name: "Half Portion",
					price: 180,
					isDefault: false,
					isAvailable: true,
					createdAt: now,
					updatedAt: now,
				}),
				MenuItemVariant.reconstitute({
					id: variantId2,
					menuItemId,
					sku: "HYD-FULL",
					name: "Full Portion",
					price: 300,
					isDefault: true,
					isAvailable: true,
					createdAt: now,
					updatedAt: now,
				}),
			],
			addons: [],
		});

		mockAddonRepo.findByIdsAndRestaurantId.mockResolvedValueOnce([
			{ id: addonId, restaurantId, name: "Mirchi Ka Salan", price: 50 } as never,
		]);

		const updatedVariant = MenuItemVariant.reconstitute({
			id: variantId2,
			menuItemId,
			sku: "HYD-FULL",
			name: "Full Portion (Family Pack)",
			price: 350,
			isDefault: true,
			isAvailable: true,
			createdAt: now,
			updatedAt: now,
		});

		mockMenuItemRepo.updateWithDetails.mockResolvedValueOnce({
			item: domainItem,
			images: [{ id: "img-2", menuItemId, objectKey: "menu/new-biryani.png", displayOrder: 0, createdAt: now }],
			variants: [updatedVariant],
			addons: [{ id: "addon-junc-1", menuItemId, addonId, name: "Mirchi Ka Salan", price: 50, priceOverride: 40 }],
		});

		const req = {
			method: "PUT",
			url: `/${restaurantId}/menu/items/${menuItemId}`,
			params: { restaurantId, menuItemId },
			body: {
				name: "Hyderabadi Dum Biryani",
				description: "Spiced basmati rice with slow cooked tender mutton",
				price: 350,
				images: [{ objectKey: "menu/new-biryani.png", displayOrder: 0 }],
				variants: [
					{
						id: variantId2,
						sku: "HYD-FULL",
						name: "Full Portion (Family Pack)",
						price: 350,
						isDefault: true,
					},
				],
				addons: [{ addonId, priceOverride: 40 }],
			},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {} as Record<string, unknown>,
		};

		const paramsMiddleware = validateRequestParams(updateMenuItemParamsSchema);
		const bodyMiddleware = validateRequestBody(updateMenuItemBodySchema);
		const nextParams = jest.fn();
		const nextBody = jest.fn();

		await paramsMiddleware(req as never, res as never, nextParams);
		expect(nextParams).toHaveBeenCalled();

		await bodyMiddleware(req as never, res as never, nextBody);
		expect(nextBody).toHaveBeenCalled();

		await controller.updateMenuItem(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: HTTP_STATUS.OK,
				message: messages.MENU_ITEM_UPDATED_SUCCESS,
				data: expect.objectContaining({
					id: menuItemId,
					variants: [
						expect.objectContaining({
							id: variantId2,
							name: "Full Portion (Family Pack)",
							price: 350,
						}),
					],
					addons: [
						expect.objectContaining({
							addonId,
							priceOverride: 40,
						}),
					],
				}),
			}),
		);
	});

	it("should reject with 422 when body is empty", async () => {
		const req = {
			method: "PATCH",
			url: `/${restaurantId}/menu/items/${menuItemId}`,
			params: { restaurantId, menuItemId },
			body: {},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const bodyMiddleware = validateRequestBody(updateMenuItemBodySchema);
		const nextBody = jest.fn();
		await bodyMiddleware(req as never, res as never, nextBody);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextBody).not.toHaveBeenCalled();
	});

	it("should reject with 422 when params has invalid UUID", async () => {
		const req = {
			method: "PUT",
			url: `/invalid/menu/items/invalid`,
			params: { restaurantId: "not-uuid", menuItemId: "not-uuid" },
			body: { name: "New Name" },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const paramsMiddleware = validateRequestParams(updateMenuItemParamsSchema);
		const nextParams = jest.fn();
		await paramsMiddleware(req as never, res as never, nextParams);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextParams).not.toHaveBeenCalled();
	});
});
