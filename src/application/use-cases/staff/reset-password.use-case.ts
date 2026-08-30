import { inject, injectable } from "inversify";
import type { ResetPasswordDTO } from "@/application/dtos/staff/reset-password.dto.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidStaffDataError,
	InvalidTempTokenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.TokenRevocationRepository)
		private readonly tokenRevocationRepository: ITokenRevocationRepository,
	) {}

	public async execute(dto: ResetPasswordDTO): Promise<void> {
		if (!dto.tempToken) {
			throw new InvalidTempTokenError("Reset token is required");
		}

		if (!dto.password || dto.password.length < 8) {
			throw new InvalidStaffDataError(
				"Password must be at least 8 characters long",
			);
		}

		// 1. Check if temp token is revoked in Redis
		const isRevoked = await this.tokenRevocationRepository.isRevoked(
			dto.tempToken,
		);
		if (isRevoked) {
			throw new InvalidTempTokenError();
		}

		// 2. Verify and decode JWT temp token
		let payload: ReturnType<ITokenService["verifyTempToken"]>;
		try {
			payload = this.tokenService.verifyTempToken(dto.tempToken);
		} catch {
			throw new InvalidTempTokenError();
		}

		if (payload.purpose !== "password-reset") {
			throw new InvalidTempTokenError("Invalid token purpose");
		}

		// 3. Find staff member
		const staff = await this.staffRepository.findById(payload.id);
		if (!staff) {
			throw new StaffNotFoundError();
		}

		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		// 4. Hash new password and update staff entity
		const hashedPassword = await this.passwordHasher.hash(dto.password);
		staff.changePassword(hashedPassword);

		// 5. Save changes in PostgreSQL
		await this.staffRepository.save(staff);

		// 6. Revoke tempToken so it cannot be used again
		await this.tokenRevocationRepository.revoke(dto.tempToken);
	}
}
