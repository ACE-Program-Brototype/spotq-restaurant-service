import { ContainerModule } from "inversify";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-cases/onboard-restaurant.use-case.port";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-cases/refresh-restaurant-access-token.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/resend-email-otp.use-case.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/send-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/verify-email-otp.use-case.port";
import { ListRestaurantsUseCase } from "@/application/use-cases/admin/list-restaurants.use-case";
import { OnboardRestaurantUseCase } from "@/application/use-cases/onboard-restaurant.use-case";
import { RefreshRestaurantAccessTokenUseCase } from "@/application/use-cases/refresh-restaurant-access-token.use-case";
import { ResendRestaurantEmailOtpUseCase } from "@/application/use-cases/resend-email-otp.use-case";
import { SendRestaurantEmailOtpUseCase } from "@/application/use-cases/send-email-otp.use-case";
import { VerifyRestaurantEmailOtpUseCase } from "@/application/use-cases/verify-email-otp.use-case";
import { TYPES } from "@/config/di/types";
import { RestaurantRepository } from "@/infrastructure/repositories/restaurant.repository";
import { AuthTokenService } from "@/infrastructure/services/auth-token.service";
import { BrevoEmailService } from "@/infrastructure/services/brevo-email.service";
import { OtpHashService } from "@/infrastructure/services/otp-hash.service";
import { OtpService } from "@/infrastructure/services/otp.service";
import { RedisOtpStore } from "@/infrastructure/services/redis-otp-store.service";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller";
import { RestaurantAuthController } from "@/presentation/http/controllers/restaurant-auth.controller";

export const restaurantAuthModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.RestaurantAuthController)
		.to(RestaurantAuthController)
		.inSingletonScope();

	bind(TYPES.Controller.AdminRestaurantController)
		.to(AdminRestaurantController)
		.inSingletonScope();

	// Use Cases
	bind<ISendRestaurantEmailOtpUseCase>(
		TYPES.UseCases.SendRestaurantEmailOtpUseCase,
	)
		.to(SendRestaurantEmailOtpUseCase)
		.inSingletonScope();

	bind<IResendRestaurantEmailOtpUseCase>(
		TYPES.UseCases.ResendRestaurantEmailOtpUseCase,
	)
		.to(ResendRestaurantEmailOtpUseCase)
		.inSingletonScope();

	bind<IVerifyRestaurantEmailOtpUseCase>(
		TYPES.UseCases.VerifyRestaurantEmailOtpUseCase,
	)
		.to(VerifyRestaurantEmailOtpUseCase)
		.inSingletonScope();

	bind<IRefreshRestaurantAccessTokenUseCase>(
		TYPES.UseCases.RefreshRestaurantAccessTokenUseCase,
	)
		.to(RefreshRestaurantAccessTokenUseCase)
		.inSingletonScope();

	bind<IOnboardRestaurantUseCase>(TYPES.UseCases.OnboardRestaurantUseCase)
		.to(OnboardRestaurantUseCase)
		.inSingletonScope();

	bind<IListRestaurantsUseCase>(TYPES.UseCases.ListRestaurantsUseCase)
		.to(ListRestaurantsUseCase)
		.inSingletonScope();

	// Repository
	bind<IRestaurantRepository>(TYPES.RestaurantRepository)
		.to(RestaurantRepository)
		.inSingletonScope();

	// Services
	bind<IOtpStore>(TYPES.Services.OtpStore)
		.to(RedisOtpStore)
		.inSingletonScope();

	bind<IEmailService>(TYPES.Services.Brevo_Email)
		.to(BrevoEmailService)
		.inSingletonScope();

	bind<IOtpService>(TYPES.Services.OtpService)
		.to(OtpService)
		.inSingletonScope();

	bind<IAuthTokenService>(TYPES.Services.AuthTokenService)
		.to(AuthTokenService)
		.inSingletonScope();

	bind<IOtpHashService>(TYPES.Services.OtpHashService)
		.to(OtpHashService)
		.inSingletonScope();
});
