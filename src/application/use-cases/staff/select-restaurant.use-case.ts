/**
 * Use case to finalize staff login by selecting a restaurant tenant.
 *
 * Workflow:
 * 1. Cryptographically verifies the ephemeral selection token issued during login.
 * 2. Scopes and validates the staff member's relationship with the requested restaurant.
 * 3. Enforces tenant-level active status and verifies restaurant operating readiness.
 * 4. Generates and returns scoped access and refresh tokens bound to the chosen restaurant.
 */
import { TYPES } from "@di/types.ts";
import { inject, injectable } from "inversify";
import type {
	SelectRestaurantDTO,
	SelectRestaurantResponseDTO,
} from "@/application/dtos/staff/select-restaurant.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import type { ISelectRestaurantUseCase } from "@/application/ports/use-cases/select-restaurant.use-case.port.ts";
import {
	InvalidTempTokenError,
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffForbiddenError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class SelectRestaurantUseCase implements ISelectRestaurantUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	/**
	 * Executes the restaurant selection workflow.
	 *
	 * @param dto - Ephemeral selection token and chosen restaurant ID
	 * @returns Full access token, refresh token, and staff profile DTO
	 */
	public async execute(
		dto: SelectRestaurantDTO,
	): Promise<SelectRestaurantResponseDTO> {
		if (!dto.selectToken) {
			throw new InvalidTempTokenError(messages.SELECTION_TOKEN_REQUIRED);
		}
		if (!dto.restaurantId) {
			throw new StaffForbiddenError(messages.RESTAURANT_ID_REQUIRED);
		}

		let payload: ReturnType<ITokenService["verifyTempToken"]>;
		try {
			payload = this.tokenService.verifyTempToken(dto.selectToken);
		} catch {
			throw new InvalidTempTokenError(
				messages.INVALID_OR_EXPIRED_SELECTION_TOKEN,
			);
		}

		if (payload?.purpose !== "restaurant-selection") {
			throw new InvalidTempTokenError(messages.INVALID_TOKEN_PURPOSE);
		}

		const staffId = payload.sub;
		const restaurantId = dto.restaurantId.trim();

		const membership = this.staffRepository.findByStaffIdAndRestaurantId
			? await this.staffRepository.findByStaffIdAndRestaurantId(
					staffId,
					restaurantId,
				)
			: await this.staffRepository.findByIdAndRestaurantId(
					staffId,
					restaurantId,
				);

		if (!membership || membership.status === "REMOVED") {
			throw new StaffForbiddenError(messages.STAFF_NOT_MEMBER_OF_RESTAURANT);
		}

		if (membership.status === "SUSPENDED" || membership.isSuspended?.()) {
			throw new StaffSuspendedError();
		}

		if (
			membership.status !== "ACTIVE" ||
			(membership.isActive && !membership.isActive())
		) {
			throw new StaffInactiveError(messages.STAFF_ACCOUNT_DEACTIVATED);
		}

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError();
		}

		if (
			!restaurant.emailVerifiedAt ||
			restaurant.onboardingStatus !== "COMPLETED" ||
			!restaurant.isSubscriptionActive
		) {
			throw new RestaurantInactiveError();
		}

		const tokenPayload: StaffTokenPayload = {
			sub: staffId,
			restaurantId,
			email: payload.email,
			role: membership.role || "STAFF",
		};

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);
		const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

		return {
			staff: StaffMapper.toDTO(membership),
			accessToken,
			refreshToken,
		};
	}
}
