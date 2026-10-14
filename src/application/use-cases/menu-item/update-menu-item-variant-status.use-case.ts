import type {
	UpdateMenuItemVariantStatusInputDto,
	UpdateMenuItemVariantStatusOutputDto,
} from "@application/dtos/menu-item/menu-item-variant.dto";
import type { IUpdateMenuItemVariantStatusUseCase } from "@application/ports/use-cases/menu-item/update-menu-item-variant-status.use-case.port";
import { TYPES } from "@config/di/types";
import {
	InvalidVariantDataError,
	MenuItemNotFoundError,
	MenuItemVariantNotFoundError,
} from "@domain/errors/menu-item.errors";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@domain/errors/restaurant.errors";
import {
	StaffForbiddenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@domain/errors/staff.errors";
import type { IMenuItemRepository } from "@domain/repositories/menu-item.repository.interface";
import type { IRestaurantStaffRepository } from "@domain/repositories/restaurant-staff.repository.interface";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import { messages } from "@shared/constants/message.constants";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateMenuItemVariantStatusUseCase
	implements IUpdateMenuItemVariantStatusUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
	) {}

	async execute(
		input: UpdateMenuItemVariantStatusInputDto,
	): Promise<UpdateMenuItemVariantStatusOutputDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError(
				messages.RESTAURANT_ACCOUNT_BLOCKED,
			);
		}


		// staff authentication 
		if (input.userRole?.toLowerCase() === "staff") {
			if (!input.userId) {
				throw new StaffForbiddenError(messages.STAFF_FORBIDDEN);
			}

			const staff = await this.staffRepository.findByStaffIdAndRestaurantId(
				input.userId,
				input.restaurantId,
			);

			if (!staff) {
				throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
			}

			if (staff.isSuspended()) {
				throw new StaffSuspendedError(messages.STAFF_ACCOUNT_SUSPENDED);
			}

			if (!staff.isActive()) {
				throw new StaffInactiveError(messages.STAFF_ACCOUNT_NOT_ACTIVE);
			}
		}

		const menuItem = await this.menuItemRepository.findByIdAndRestaurantId(
			input.menuItemId,
			input.restaurantId,
		);
		if (!menuItem || menuItem.item.isDeleted) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		const variant = menuItem.variants.find((v) => v.id === input.id);
		if (!variant) {
			throw new MenuItemVariantNotFoundError(
				messages.MENU_ITEM_VARIANT_NOT_FOUND,
			);
		}

		let newDefaultVariantId: string | undefined;

		// check if the variant is default variant
		if (variant.isAvailable) {
			const activeVariants = menuItem.variants.filter((v) => v.isAvailable);
			if (activeVariants.length <= 1) {
				throw new InvalidVariantDataError(
					messages.AT_LEAST_ONE_ACTIVE_VARIANT_REQUIRED,
				);
			}

			// If the default variant is set to isAvailable:false
			// then update the default varient to another available variant
			if (variant.isDefault) {
				const nextDefault = activeVariants.find((v) => v.id !== variant.id);
				if (nextDefault) {
					newDefaultVariantId = nextDefault.id;
				}
			}
		}

		const result = await this.menuItemRepository.updateVariantAvailability(
			input.id,
			input.menuItemId,
			input.restaurantId,
			!variant.isAvailable,
			newDefaultVariantId,
		);

		return result;
	}
}
