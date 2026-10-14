import { inject, injectable } from "inversify";
import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import type { UpdateAddonInputDto } from "@/application/dtos/addon/update-addon.dto.ts";
import { AddonMapper } from "@/application/mappers/addon.mapper.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { IUpdateAddonUseCase } from "@application/ports/use-cases/addon/update-addon.use-case.port";
import { TYPES } from "@/config/di/types.ts";
import {
	AddonAlreadyExistsError,
	AddonNotFoundError,
} from "@/domain/errors/addon.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import {
	StaffForbiddenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateAddonUseCase implements IUpdateAddonUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.AddonRepository)
		private readonly addonRepository: IAddonRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
	) {}

	public async execute(input: UpdateAddonInputDto): Promise<AddonResponseDto> {
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

		const addon = await this.addonRepository.findById(input.addonId);
		if (
			!addon ||
			addon.restaurantId !== input.restaurantId ||
			addon.isDeleted
		) {
			throw new AddonNotFoundError(messages.ADDON_NOT_FOUND);
		}

		if (input.name !== undefined) {
			const trimmedName = input.name.trim();
			if (
				trimmedName.length > 0 &&
				trimmedName.toLowerCase() !== addon.name.toLowerCase()
			) {
				const existingAddon =
					await this.addonRepository.findByNameAndRestaurantId(
						trimmedName,
						input.restaurantId,
					);
				if (existingAddon && existingAddon.id !== addon.id) {
					throw new AddonAlreadyExistsError(messages.ADDON_ALREADY_EXISTS);
				}
			}
		}

		addon.update({
			name: input.name,
			description: input.description,
			price: input.price,
			imageKey: input.imageKey,
			isAvailable: input.isAvailable,
		});

		const updated = await this.addonRepository.updateAddon(addon);

		return AddonMapper.toResponseDto(updated);
	}
}
