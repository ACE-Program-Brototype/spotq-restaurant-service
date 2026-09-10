import { inject, injectable } from "inversify";
import type { ResetPasswordDTO } from "@/application/dtos/staff/reset-password.dto.ts";
import type { IPasswordHasher } from "@/application/ports/services/password-hasher.port.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import type { IResetPasswordUseCase } from "@/application/ports/use-cases/reset-password.use-case.port.ts";
import { TYPES } from "@di/types.ts";
import {
	InvalidStaffDataError,
	InvalidTempTokenError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

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
			throw new InvalidTempTokenError(messages.RESET_TOKEN_REQUIRED);
		}

		if (!dto.password || dto.password.length < 8) {
			throw new InvalidStaffDataError(messages.PASSWORD_HASH_REQUIRED);
		}

		const isRevoked = await this.tokenRevocationRepository.isRevoked(
			dto.tempToken,
		);
		if (isRevoked) {
			throw new InvalidTempTokenError();
		}

		let payload: ReturnType<ITokenService["verifyTempToken"]>;
		try {
			payload = this.tokenService.verifyTempToken(dto.tempToken);
		} catch {
			throw new InvalidTempTokenError();
		}

		if (payload.purpose !== "password-reset") {
			throw new InvalidTempTokenError(messages.INVALID_TOKEN_PURPOSE);
		}

		const staffId = (payload as unknown as { sub?: string; id?: string }).sub ?? (payload as unknown as { id?: string }).id;
		const staff = await this.staffRepository.findById(staffId as string);
		if (!staff) {
			throw new StaffNotFoundError();
		}

		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		const hashedPassword = await this.passwordHasher.hash(dto.password);
		staff.changePassword(hashedPassword);

		await this.staffRepository.save(staff);

		await this.tokenRevocationRepository.revoke(dto.tempToken);
	}
}
