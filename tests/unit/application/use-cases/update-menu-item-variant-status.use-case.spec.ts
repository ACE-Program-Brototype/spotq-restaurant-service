import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UpdateMenuItemVariantStatusUseCase } from "@/application/use-cases/menu-item/update-menu-item-variant-status.use-case";
import type { Restaurant } from "@/domain/entities/restaurant.entity";
import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity";
import {
	InvalidVariantDataError,
	MenuItemNotFoundError,
	MenuItemVariantNotFoundError,
} from "@/domain/errors/menu-item.errors";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors";
import {
	StaffForbiddenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors";
import type {
	IMenuItemRepository,
	MenuItemDetailsAggregate,
} from "@/domain/repositories/menu-item.repository.interface";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface";

describe("UpdateMenuItemVariantStatusUseCase", () => {
	let useCase: UpdateMenuItemVariantStatusUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantRepository>;
	let mockMenuItemRepo: jest.Mocked<IMenuItemRepository>;
	let mockStaffRepo: jest.Mocked<IRestaurantStaffRepository>;

	const restaurantId = "rest-uuid-111";
	const menuItemId = "menu-uuid-222";
	const variantId = "var-uuid-333";
	const otherVariantId = "var-uuid-444";
	const staffUserId = "staff-uuid-555";

	beforeEach(() => {
		jest.clearAllMocks();

		mockRestaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		mockMenuItemRepo = {
			findByIdAndRestaurantId: jest.fn(),
			updateVariantAvailability: jest.fn(),
		} as unknown as jest.Mocked<IMenuItemRepository>;

		mockStaffRepo = {
			findByStaffIdAndRestaurantId: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantStaffRepository>;

		useCase = new UpdateMenuItemVariantStatusUseCase(
			mockRestaurantRepo,
			mockMenuItemRepo,
			mockStaffRepo,
		);
	});

	it("should throw RestaurantNotFoundError when restaurant does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});

	it("should throw RestaurantAccountBlockedError when restaurant is blocked", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: true,
		} as Restaurant);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
	});

	it("should throw StaffForbiddenError when userRole is staff but userId is missing", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
				userRole: "staff",
			}),
		).rejects.toThrow(StaffForbiddenError);
	});

	it("should throw StaffNotFoundError when staff is not found in database", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockStaffRepo.findByStaffIdAndRestaurantId.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
				userId: staffUserId,
				userRole: "staff",
			}),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffSuspendedError when staff is suspended", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockStaffRepo.findByStaffIdAndRestaurantId.mockResolvedValueOnce({
			isActive: () => false,
			isSuspended: () => true,
		} as RestaurantStaff);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
				userId: staffUserId,
				userRole: "staff",
			}),
		).rejects.toThrow(StaffSuspendedError);
	});

	it("should throw StaffInactiveError when staff is inactive", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockStaffRepo.findByStaffIdAndRestaurantId.mockResolvedValueOnce({
			isActive: () => false,
			isSuspended: () => false,
		} as RestaurantStaff);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
				userId: staffUserId,
				userRole: "staff",
			}),
		).rejects.toThrow(StaffInactiveError);
	});

	it("should throw MenuItemNotFoundError when menu item does not exist", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce(null);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should throw MenuItemNotFoundError when menu item is soft deleted", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: { isDeleted: true },
			variants: [],
		} as unknown as MenuItemDetailsAggregate);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(MenuItemNotFoundError);
	});

	it("should throw MenuItemVariantNotFoundError when variant does not exist on item", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: { isDeleted: false },
			variants: [{ id: "other-var", isAvailable: true }],
		} as unknown as MenuItemDetailsAggregate);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(MenuItemVariantNotFoundError);
	});

	it("should throw InvalidVariantDataError when toggling off the last active variant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: { isDeleted: false },
			variants: [
				{ id: variantId, isAvailable: true, isDefault: true },
				{ id: otherVariantId, isAvailable: false, isDefault: false },
			],
		} as unknown as MenuItemDetailsAggregate);

		await expect(
			useCase.execute({
				id: variantId,
				menuItemId,
				restaurantId,
			}),
		).rejects.toThrow(InvalidVariantDataError);
	});

	it("should reassign default variant when toggling off current default variant", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: { isDeleted: false },
			variants: [
				{ id: variantId, isAvailable: true, isDefault: true },
				{ id: otherVariantId, isAvailable: true, isDefault: false },
			],
		} as unknown as MenuItemDetailsAggregate);

		mockMenuItemRepo.updateVariantAvailability.mockResolvedValueOnce({
			id: variantId,
			menuItemId,
			restaurantId,
			name: "Small",
			sku: null,
			price: 100,
			isDefault: false,
			isAvailable: false,
			updatedAt: new Date(),
		});

		const result = await useCase.execute({
			id: variantId,
			menuItemId,
			restaurantId,
		});

		expect(result.id).toBe(variantId);
		expect(mockMenuItemRepo.updateVariantAvailability).toHaveBeenCalledWith(
			variantId,
			menuItemId,
			restaurantId,
			false,
			otherVariantId,
		);
	});

	it("should toggle availability successfully for active staff member", async () => {
		mockRestaurantRepo.findById.mockResolvedValueOnce({
			id: restaurantId,
			isBlocked: false,
		} as Restaurant);
		mockStaffRepo.findByStaffIdAndRestaurantId.mockResolvedValueOnce({
			isActive: () => true,
			isSuspended: () => false,
		} as RestaurantStaff);
		mockMenuItemRepo.findByIdAndRestaurantId.mockResolvedValueOnce({
			item: { isDeleted: false },
			variants: [
				{ id: variantId, isAvailable: false, isDefault: false },
				{ id: otherVariantId, isAvailable: true, isDefault: true },
			],
		} as unknown as MenuItemDetailsAggregate);

		mockMenuItemRepo.updateVariantAvailability.mockResolvedValueOnce({
			id: variantId,
			menuItemId,
			restaurantId,
			name: "Small",
			sku: null,
			price: 100,
			isDefault: false,
			isAvailable: true,
			updatedAt: new Date(),
		});

		const result = await useCase.execute({
			id: variantId,
			menuItemId,
			restaurantId,
			userId: staffUserId,
			userRole: "staff",
		});

		expect(result.id).toBe(variantId);
		expect(result.isAvailable).toBe(true);
		expect(mockMenuItemRepo.updateVariantAvailability).toHaveBeenCalledWith(
			variantId,
			menuItemId,
			restaurantId,
			true,
			undefined,
		);
	});
});
