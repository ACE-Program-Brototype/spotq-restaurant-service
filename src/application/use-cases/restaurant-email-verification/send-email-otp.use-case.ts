import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class SendRestaurantEmailOtpUseCase
	implements ISendRestaurantEmailOtpUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(dto: SendRestaurantEmailOtpDto) {
		const { email } = dto;

		const mess = `Welcome ${email} to spotQ`;

		const res = await this.restaurantRepository.existsByEmail(email);
		console.log(res);

		return mess;
	}
}
