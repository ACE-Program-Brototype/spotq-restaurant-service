import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class SendRestaurantEmailOtpUseCase implements ISendRestaurantEmailOtpUseCase {
  constructor(
    @inject(TYPES.Repositories.RestaurantRepository)
	@inject(TYPES.Services.OtpStore)
    private readonly restaurantRepository: IRestaurantRepository,
	private readonly redisOtpStore: IOtpStore
  ) {}

  async execute(dto: SendRestaurantEmailOtpDto) {

    const { email } = dto;

    const restaurantExists = await this.restaurantRepository.existsByEmail(
      email,
    );

    if (restaurantExists) {
      return;
    }
  }
}
