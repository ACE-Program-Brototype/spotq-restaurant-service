import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { IGetInternalMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-internal-menu-item-details.use-case.port.ts";
import type { IValidateRestaurantEligibilityUseCase } from "@/application/ports/use-cases/validate-restaurant-eligibility.use-case.port.ts";
import { InternalRestaurantController } from "@/presentation/http/controllers/internal-restaurant.controller.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("InternalRestaurantController", () => {
	let validateRestaurantEligibilityUseCase: jest.Mocked<IValidateRestaurantEligibilityUseCase>;
	let getInternalMenuItemDetailsUseCase: jest.Mocked<IGetInternalMenuItemDetailsUseCase>;
	let controller: InternalRestaurantController;
	let req: Partial<Request>;
	let res: Partial<Response>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const menuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	beforeEach(() => {
		validateRestaurantEligibilityUseCase = {
			execute: jest.fn(),
		};
		getInternalMenuItemDetailsUseCase = {
			execute: jest.fn(),
		};

		controller = new InternalRestaurantController(
			validateRestaurantEligibilityUseCase,
			getInternalMenuItemDetailsUseCase,
		);

		res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
	});

	describe("validateRestaurant", () => {
		it("should return 200 with validation result", async () => {
			req = {
				params: { restaurantId },
			};

			const mockValidationResult = {
				restaurantId,
				restaurantName: "Spice Kitchen",
				verificationStatus: "ACTIVE" as never,
				isBlocked: false,
				blockReason: null,
				isSubscriptionActive: true,
				subscriptionPlanCode: "PREMIUM",
				subscriptionEndsAt: "2026-12-31T23:59:59.000Z",
				canAccessQueueService: true,
			};

			validateRestaurantEligibilityUseCase.execute.mockResolvedValue(
				mockValidationResult,
			);

			await controller.validateRestaurant(req as Request, res as Response);

			expect(validateRestaurantEligibilityUseCase.execute).toHaveBeenCalledWith(
				restaurantId,
			);
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.RESTAURANT_STATUS_AND_SUBSCRIPTION_VERIFIED,
					data: mockValidationResult,
				}),
			);
		});
	});

	describe("getMenuItemDetails", () => {
		it("should return 200 with menu item details", async () => {
			req = {
				params: {
					restaurantId,
					menuItemId,
				},
			};

			const mockDetailsResult = {
				id: menuItemId,
				restaurantId,
				categoryId: "cat-1",
				categoryName: "Main Course",
				category: {
					id: "cat-1",
					name: "Main Course",
					description: "Delicious mains",
				},
				name: "Butter Chicken",
				description: "Rich and creamy",
				price: 320,
				preparationTime: 25,
				calories: 650,
				isVegetarian: false,
				isFeatured: true,
				isAvailable: true,
				images: [],
				variants: [],
				addons: [],
			};

			getInternalMenuItemDetailsUseCase.execute.mockResolvedValue(
				mockDetailsResult,
			);

			await controller.getMenuItemDetails(req as Request, res as Response);

			expect(getInternalMenuItemDetailsUseCase.execute).toHaveBeenCalledWith({
				restaurantId,
				menuItemId,
			});
			expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: messages.MENU_ITEM_DETAILS_FETCHED_SUCCESS,
					data: mockDetailsResult,
				}),
			);
		});
	});
});
