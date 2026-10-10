
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { ListCustomerRestaurantsUseCase } from "@/application/use-cases/list-customer-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import type { ListCustomerRestaurantsQuery } from "@/presentation/http/validators/list-customer-restaurants.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendPaginatedSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class CustomerRestaurantController {
  constructor(
    @inject(TYPES.UseCases.ListCustomerRestaurantsUseCase)
    private readonly listCustomerRestaurantsUseCase: ListCustomerRestaurantsUseCase,
  ) {}

  public listRestaurants = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const query = (res.locals?.query ?? req.query) as ListCustomerRestaurantsQuery;

    const result = await this.listCustomerRestaurantsUseCase.execute(query);

    sendPaginatedSuccessResponse(
      res,
      result.data,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
      messages.SUCCESS,
      HTTP_STATUS.OK,
    );
  };
}
