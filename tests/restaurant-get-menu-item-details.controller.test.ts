import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { GetMenuItemDetailsUseCase } from "@/application/use-cases/get-menu-item-details.use-case.ts";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";
import { validateRequestParams } from "@/presentation/http/middleware/validation.middleware.ts";
import { getMenuItemDetailsParamsSchema } from "@/presentation/http/validators/get-menu-item-details.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("GET /:restaurantId/menu/items/:menuItemId - Route Level & Acceptance Criteria Suite", () => {
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
			findByIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		const getDetailsUseCase = new GetMenuItemDetailsUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
		);

		controller = new MenuItemController(
			{} as never,
			{} as never,
			getDetailsUseCase,
		);
	});

	it("AC1-AC6: should return 200 with complete menu item details including variants, addons, categories, and image keys", async () => {
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
			createdAt: now,
			updatedAt: now,
		});

		const domainVariant1 = MenuItemVariant.reconstitute({
			id: "var-1",
			menuItemId,
			sku: "BURGER-MED",
			name: "Medium",
			price: 14.5,
			isDefault: true,
			createdAt: now,
			updatedAt: now,
		});

		const domainVariant2 = MenuItemVariant.reconstitute({
			id: "var-2",
			menuItemId,
			sku: "BURGER-LRG",
			name: "Large",
			price: 17.5,
			isDefault: false,
			createdAt: now,
			updatedAt: now,
		});

		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
			statusVO: {
				isActive: () => true,
				isApproved: () => true,
			},
		} as never);

		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: domainItem,
			category: {
				id: "cat-1",
				name: "Burgers & Sandwiches",
				description: "Handcrafted gourmet burgers",
				isActive: true,
			},
			images: [
				{
					id: "img-1",
					menuItemId,
					objectKey: "menu/burgers/cheeseburger-front.jpg",
					displayOrder: 0,
					createdAt: now,
				},
			],
			variants: [domainVariant1, domainVariant2],
			addons: [
				{
					id: "addon-link-1",
					menuItemId,
					addonId: "addon-1",
					name: "Extra Bacon",
					description: "Smoked crispy bacon",
					price: 2.5,
					priceOverride: 3.0,
					imageKey: "addons/bacon.jpg",
					isAvailable: true,
					isDeleted: false,
				},
			],
		});

		const req = {
			method: "GET",
			url: `/${restaurantId}/menu/items/${menuItemId}`,
			params: { restaurantId, menuItemId },
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {} as Record<string, unknown>,
		};

		const paramsMiddleware = validateRequestParams(
			getMenuItemDetailsParamsSchema,
		);
		const nextParams = jest.fn();
		await paramsMiddleware(req as never, res as never, nextParams);
		expect(nextParams).toHaveBeenCalled();

		await controller.getMenuItemDetails(req as never, res as never);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.OK);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 200,
				message: messages.MENU_ITEM_DETAILS_FETCHED_SUCCESS,
				data: expect.objectContaining({
					id: menuItemId,
					restaurantId,
					name: "Classic Cheeseburger",
					description: "Juicy beef patty with aged cheddar",
					price: 14.5,
					preparationTime: 20,
					calories: 680,
					isVegetarian: false,
					isFeatured: true,
					isAvailable: true,
					categoryName: "Burgers & Sandwiches",
					category: {
						id: "cat-1",
						name: "Burgers & Sandwiches",
						description: "Handcrafted gourmet burgers",
					},
					images: [
						{
							id: "img-1",
							objectKey: "menu/burgers/cheeseburger-front.jpg",
							displayOrder: 0,
						},
					],
					variants: [
						expect.objectContaining({
							id: "var-1",
							sku: "BURGER-MED",
							name: "Medium",
							price: 14.5,
							isDefault: true,
							isAvailable: true,
						}),
						expect.objectContaining({
							id: "var-2",
							sku: "BURGER-LRG",
							name: "Large",
							price: 17.5,
							isDefault: false,
							isAvailable: true,
						}),
					],
					addons: [
						expect.objectContaining({
							id: "addon-link-1",
							addonId: "addon-1",
							name: "Extra Bacon",
							price: 2.5,
							priceOverride: 3.0,
							imageKey: "addons/bacon.jpg",
							isAvailable: true,
						}),
					],
				}),
			}),
		);
	});

	it("AC7: should reject with 422 when restaurantId or menuItemId is invalid UUID", async () => {
		const req = {
			method: "GET",
			url: `/invalid-uuid/menu/items/not-a-uuid`,
			params: {
				restaurantId: "invalid-uuid",
				menuItemId: "not-a-uuid",
			},
		};

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			json: jsonMock,
			locals: {},
		};

		const paramsMiddleware = validateRequestParams(
			getMenuItemDetailsParamsSchema,
		);
		const nextParams = jest.fn();
		await paramsMiddleware(req as never, res as never, nextParams);

		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(nextParams).not.toHaveBeenCalled();
	});
});
