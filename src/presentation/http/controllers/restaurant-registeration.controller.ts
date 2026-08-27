import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IRegisterRestaurantUseCase } from "@/application/ports/use-case/register-restaurant.use-case.port";
import { TYPES } from "@/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { AppError } from "@/utils/response.model";

@injectable()
export class RestaurantRegistrationController {
	constructor(
		@inject(TYPES.UseCases.RegisterRestaurantUseCase)
		private readonly registerRestaurantUseCase: IRegisterRestaurantUseCase,
	) {}

	async register(req: Request, res: Response): Promise<Response> {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader?.startsWith("Bearer ")) {
			throw new AppError(
				"Verification token is required",
				HTTP_STATUS.UNAUTHORIZED,
			);
		}

		const verificationToken = authorizationHeader.substring(7);

		await this.registerRestaurantUseCase.execute(req.body, verificationToken);

		return res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: "Restaurant registered successfully",
		});
	}
}
