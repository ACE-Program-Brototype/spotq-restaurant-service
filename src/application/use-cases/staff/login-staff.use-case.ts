import { inject, injectable } from "inversify";
import type { LoginStaffDTO } from "@/application/dtos/staff/login-staff.dto.ts";
import type { LoginStaffResponseDTO } from "@/application/dtos/staff/staff-response.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type {
	ITokenService,
	StaffTokenPayload,
} from "@/application/ports/services/token-service.port.ts";
import type { ILoginStaffUseCase } from "@/application/ports/use-cases/login-staff.use-case.port.ts";
import { TYPES } from "@di/types.ts";
import {
	InvalidCredentialsError,
	RestaurantAccountBlockedError,
	RestaurantInactiveError,
	RestaurantNotFoundError,
	StaffInactiveError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";

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

	public async execute(dto: LoginStaffDTO): Promise<LoginStaffResponseDTO> {
		const emailVO = StaffEmail.create(dto.email);

		const staff = await this.staffRepository.findByEmail(emailVO.value);
		if (!staff) {
			throw new InvalidCredentialsError();
		}

		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		const isPasswordValid = await this.passwordHasher.compare(
			dto.password,
			staff.passwordHash,
		);

		if (!isPasswordValid) {
			throw new InvalidCredentialsError();
		}

		const restaurant = await this.restaurantRepository.findById(
			staff.restaurantId,
		);
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
			sub: staff.id,
			restaurantId: staff.restaurantId,
			email: staff.email,
			role: staff.role,
		};

		const accessToken = this.tokenService.generateAccessToken(tokenPayload);
		const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

		return {
			staff: StaffMapper.toDTO(staff),
			accessToken,
			refreshToken,
		};
	}
}
