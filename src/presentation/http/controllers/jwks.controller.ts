import type { IJwkService } from "@application/ports/services/IJwk.service";
import { HTTP_STATUS } from "@shared/constants/http.constants";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";

@injectable()
export class JwksController {
	constructor(
		@inject(TYPES.JWKService)
		private readonly jwksService: IJwkService,
	) {}

	public async getJwks(_req: Request, res: Response): Promise<Response> {
		const jwks = await this.jwksService.getJwks();

		return res.status(HTTP_STATUS.OK).json(jwks);
	}
}
