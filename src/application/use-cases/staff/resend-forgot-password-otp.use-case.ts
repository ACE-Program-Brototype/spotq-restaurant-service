import { inject, injectable } from "inversify";
import type { ResendForgotPasswordOtpDTO } from "@/application/dtos/staff/resend-forgot-password-otp.dto.ts";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";
import type { IResendForgotPasswordOtpUseCase } from "@/application/ports/use-cases/resend-forgot-password-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { StaffEmail } from "@/domain/value-objects/email.vo.ts";

@injectable()
export class ResendForgotPasswordOtpUseCase
	implements IResendForgotPasswordOtpUseCase
{
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.OtpRepository)
		private readonly otpRepository: IOtpRepository,
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.EmailQueuePort)
		private readonly emailQueuePort: IEmailQueuePort,
	) {}

	public async execute(dto: ResendForgotPasswordOtpDTO): Promise<void> {
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

		// Generate 6-digit OTP using injected port service
		const otp = this.otpService.generateOtp(6);

		// Refresh OTP in Redis with 5 minutes (300s) TTL
		await this.otpRepository.saveOtp(emailVO.value, otp, 300);

		// Queue email dispatch via port
		await this.emailQueuePort.sendVerificationOtp({
			to: emailVO.value,
			otp,
			recipientName: staff.fullname,
			validityMinutes: 5,
		});
	}
}
