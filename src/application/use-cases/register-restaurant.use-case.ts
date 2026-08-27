import type { RegisterRestaurantDto } from "@/application/dto/restaurant-registration.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";
import type { IPasswordService } from "@/application/ports/services/password.service.port";
import type { IRegisterRestaurantUseCase } from "@/application/ports/use-case/register-restaurant.use-case.port";
import { TYPES } from "@/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { AppError } from "@/utils/response.model";
import { inject, injectable } from "inversify";

@injectable()
export class RegisterRestaurantUseCase
	implements IRegisterRestaurantUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.EmailVerification)
		private readonly emailVerificationService: IEmailVerificationService,

		@inject(TYPES.Services.PasswordService)
		private readonly passwordService: IPasswordService,
	) {}

	async execute(
		dto: RegisterRestaurantDto,
		verificationToken: string,
	): Promise<void> {

		const email =
			await this.emailVerificationService.getVerifiedEmail(
				verificationToken,
			);

		if (!email) {
			throw new AppError(
				"Invalid or expired verification token",
				HTTP_STATUS.UNAUTHORIZED,
			);
		}

		const restaurantExists =
			await this.restaurantRepository.existsByEmail(email);

		if (restaurantExists) {
			throw new AppError(
				"Restaurant with this email already exists",
				HTTP_STATUS.CONFLICT,
			);
		}

		const passwordHash =
			await this.passwordService.hash(dto.password);

		await this.restaurantRepository.createRestaurant({
			restaurantName: dto.restaurantName,
			email,
			phone: dto.phone,
			ownerName: dto.ownerName,
			ownerEmail: dto.ownerEmail,
			passwordHash,
			emailVerifiedAt: new Date(),
		});

		await this.emailVerificationService.deleteVerificationToken(
			verificationToken,
		);
	}
}