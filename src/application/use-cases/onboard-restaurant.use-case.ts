import type { OnboardRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";
import { TYPES } from "@/di/types";
import { inject, injectable } from "inversify";
import { RestaurantAlreadyExistsError } from "../errors/restaurant-already-exists.error";
import { InvalidVerificationTokenError } from "../errors/invalid-verification-token.error";

@injectable()
export class OnboardRestaurantUseCase implements IOnboardRestaurantUseCase{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.EmailVerification)
		private readonly emailVerificationService: IEmailVerificationService,

	) {}

	async execute(
		dto: OnboardRestaurantDto,
		verificationToken: string,
	): Promise<void> {
		const email =
			await this.emailVerificationService.getVerifiedEmail(verificationToken);

		if (!email) {
			throw new InvalidVerificationTokenError();
		}

		const restaurantExists =
			await this.restaurantRepository.existsByEmail(email);

		if (restaurantExists) {
			throw new RestaurantAlreadyExistsError();
		}

		await this.restaurantRepository.createRestaurant({
			restaurantName: dto.restaurantName,
			email,
			phone: dto.phone,
			ownerName: dto.ownerName,
			ownerEmail: dto.ownerEmail,
			emailVerifiedAt: new Date(),
		});

		await this.emailVerificationService.deleteVerificationToken(
			verificationToken,
		);
	}
}
