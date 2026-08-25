import { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import { injectable } from "inversify";


@injectable()
export class SendRestaurantEmailOtpUseCase
implements ISendRestaurantEmailOtpUseCase {

    async execute( dto:SendRestaurantEmailOtpDto ) {

        const { email } = dto;

        const mess = `Welcome ${email} to spotQ`;

        return mess;
    }
}