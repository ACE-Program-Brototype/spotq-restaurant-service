/**
 * Use case to authenticate a staff member and route them to their workspace.
 *
 * Workflow:
 * 1. Validates staff credentials against the global Staff identity store.
 * 2. Retrieves and filters all associated restaurant memberships.
 * 3. Enforces operational readiness checks on candidate restaurants (active, onboarding completed, subscription active).
 * 4. Resolves single-tenant vs multi-tenant access:
 *    - If associated with 1 active restaurant: issues full scoped tokens immediately.
 *    - If associated with multiple restaurants or an inactive restaurant: issues an ephemeral selection token
 *      and returns eligible restaurant options for client-side tenant selection.
 */
import { TYPES } from "@di/types.ts";
import { inject, injectable } from "inversify";
import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type {
	LoginStaffResponseDTO,
	RestaurantOptionDTO,
} from "@/application/dtos/staff/staff-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import {
	InvalidCredentialsError,
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffForbiddenError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class LoginStaffUseCase implements ILoginStaffUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	/**
	 * Authenticates staff member credentials and coordinates restaurant selection.
	 *
	 * @param dto - User email, password, and optional pre-selected restaurantId
	 * @returns Full access tokens or selection prompt payload
	 */
	public async execute(dto: LoginStaffDTO): Promise<LoginStaffResponseDTO> {
		const emailVO = StaffEmail.create(dto.email);

		const staff = await this.staffRepository.findByEmail(emailVO.value);
		if (!staff) {
			throw new InvalidCredentialsError();
		}

		if (!this.staffRepository.findActiveByStaffId) {
			if (staff.isSuspended()) {
				throw new StaffSuspendedError();
			}
			if (!staff.isActive()) {
				throw new StaffInactiveError();
			}
		}

		const isPasswordValid = await this.passwordHasher.compare(
			dto.password,
			staff.passwordHash,
		);

		if (!isPasswordValid) {
			throw new InvalidCredentialsError();
		}

		const staffId = staff.staffId || staff.id;

		const memberships = this.staffRepository.findActiveByStaffId
			? await this.staffRepository.findActiveByStaffId(staffId)
			: [];

		const restaurantResults = await Promise.all(
			memberships.map((m) => this.restaurantRepository.findById(m.restaurantId)),
		);

		const validMemberships: typeof memberships = [];
		for (let i = 0; i < memberships.length; i++) {
			const m = memberships[i];
			const res = restaurantResults[i];
			if (
				res &&
				!res.isBlocked &&
				res.emailVerifiedAt &&
				res.onboardingStatus === "COMPLETED" &&
				res.isSubscriptionActive
			) {
				validMemberships.push({
					...m,
					restaurantName: res.restaurantName,
				});
			}
		}

		const requestedRestaurantId = dto.restaurantId;
		if (requestedRestaurantId) {
			const match = validMemberships.find(
				(m) => m.restaurantId === requestedRestaurantId,
			);
			if (!match) {
				throw new StaffForbiddenError(messages.STAFF_NOT_MEMBER_OF_RESTAURANT);
			}

			if (match.membership.isSuspended?.()) {
				throw new StaffSuspendedError();
			}

			if (
				match.membership.status !== "ACTIVE" ||
				(match.membership.isActive && !match.membership.isActive())
			) {
				throw new StaffInactiveError(messages.STAFF_ACCOUNT_DEACTIVATED);
			}

			const tokenPayload: StaffTokenPayload = {
				sub: staffId,
				restaurantId: match.restaurantId,
				email: staff.email,
				role: match.role || "STAFF",
			};

			const accessToken = this.tokenService.generateAccessToken(tokenPayload);
			const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

			return {
				requiresRestaurantSelection: false,
				staff: StaffMapper.toDTO(match.membership),
				accessToken,
				refreshToken,
			};
		}

		if (validMemberships.length > 1) {
			const selectToken = this.tokenService.generateTempToken({
				sub: staffId,
				email: staff.email,
				purpose: "restaurant-selection",
			});

			const restaurantOptions: RestaurantOptionDTO[] = validMemberships.map(
				(m) => ({
					id: m.restaurantId,
					restaurantId: m.restaurantId,
					name: m.restaurantName,
					restaurantName: m.restaurantName,
					role: m.role || "STAFF",
					status: m.membership.status || m.status || "ACTIVE",
				}),
			);

			return {
				requiresRestaurantSelection: true,
				selectToken,
				restaurants: restaurantOptions,
			};
		}

		if (validMemberships.length === 1) {
			const singleMembership = validMemberships[0];

			if (singleMembership.membership.isSuspended?.()) {
				throw new StaffSuspendedError();
			}

			if (
				singleMembership.membership.status !== "ACTIVE" ||
				(singleMembership.membership.isActive &&
					!singleMembership.membership.isActive())
			) {
				throw new StaffInactiveError(messages.STAFF_ACCOUNT_DEACTIVATED);
			}

			const tokenPayload: StaffTokenPayload = {
				sub: staffId,
				restaurantId: singleMembership.restaurantId,
				email: staff.email,
				role: singleMembership.role || "STAFF",
			};

			const accessToken = this.tokenService.generateAccessToken(tokenPayload);
			const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

			return {
				requiresRestaurantSelection: false,
				staff: StaffMapper.toDTO(singleMembership.membership),
				accessToken,
				refreshToken,
			};
		}

		const targetRestaurantId = staff.restaurantId;
		if (!targetRestaurantId) {
			throw new StaffInactiveError(messages.NO_ACTIVE_RESTAURANT_MEMBERSHIPS);
		}

		const restaurant =
			await this.restaurantRepository.findById(targetRestaurantId);
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
			restaurantId: staff.restaurantId,
			email: staff.email,
			role: staff.role || "STAFF",
		};

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);
		const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

		return {
			requiresRestaurantSelection: false,
			staff: StaffMapper.toDTO(staff),
			accessToken,
			refreshToken,
		};
	}
}
