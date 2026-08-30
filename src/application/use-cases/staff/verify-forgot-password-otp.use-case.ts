import { inject, injectable } from "inversify";
import type {
	VerifyForgotPasswordOtpDTO,
	VerifyForgotPasswordOtpResponseDTO,
} from "@/application/dtos/staff/verify-forgot-password-otp.dto.ts";
import type { ITokenService } from "@/application/ports/services/token-service.port.ts";
import type { IVerifyForgotPasswordOtpUseCase } from "@/application/ports/use-cases/verify-forgot-password-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidOtpError,
	OtpExpiredError,
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";

@injectable()
export class VerifyForgotPasswordOtpUseCase
	implements IVerifyForgotPasswordOtpUseCase
{
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.OtpRepository)
		private readonly otpRepository: IOtpRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
	) {}

	public async execute(
		dto: VerifyForgotPasswordOtpDTO,
	): Promise<VerifyForgotPasswordOtpResponseDTO> {
		const emailVO = StaffEmail.create(dto.email);

		const staff = await this.staffRepository.findByEmail(emailVO.value);
		if (!staff) {
			throw new StaffNotFoundError();
		}

		if (staff.isSuspended()) {
			throw new StaffSuspendedError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		const storedHash = await this.otpRepository.getOtp(emailVO.value);
		if (!storedHash) {
			throw new OtpExpiredError();
		}

		const isValid = await this.otpRepository.verifyOtp(emailVO.value, dto.otp);
		if (!isValid) {
			throw new InvalidOtpError();
		}

		// Delete verified OTP so it cannot be reused
		await this.otpRepository.deleteOtp(emailVO.value);

		// Issue temp token with purpose: 'password-reset'
		const tempToken = this.tokenService.generateTempToken({
			id: staff.id,
			email: staff.email,
			purpose: "password-reset",
		});

		return {
			tempToken,
		};
	}
}
