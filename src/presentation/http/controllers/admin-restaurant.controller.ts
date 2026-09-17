import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { BlockRestaurantResponseDto } from "@/application/dtos/admin/block-restaurant.dto.ts";
import type { RestaurantApplicationDetailsResponseDto } from "@/application/dtos/admin/get-restaurant-application-details.dto.ts";
import type { RestaurantApplicationItemDto } from "@/application/dtos/admin/list-restaurant-applications.dto.ts";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantResponseMapper } from "@/presentation/http/mappers/admin-restaurant-response.mapper.ts";
import type { AuthenticatedAdminRequest } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import type { ApproveRestaurantParams } from "@/presentation/http/validators/admin/approve-restaurant.validator.ts";
import type {
	BlockRestaurantBody,
	BlockRestaurantParam,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";
import type { GetRestaurantApplicationDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-application-details.validator.ts";
import type { GetRestaurantDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import type { ListRestaurantApplicationsQuery } from "@/presentation/http/validators/admin/list-restaurant-applications.validator.ts";
import type { ListRestaurantsQuery } from "@/presentation/http/validators/admin/list-restaurants.validator.ts";
import type {
	RejectRestaurantBody,
	RejectRestaurantParams,
} from "@/presentation/http/validators/admin/reject-restaurant.validator.ts";
import type { UnblockRestaurantParam } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedAdmin } from "@/types/express.d.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.UseCases.ApproveRestaurantUseCase)
		private readonly approveRestaurantUseCase: IApproveRestaurantUseCase,
		@inject(TYPES.UseCases.RejectRestaurantUseCase)
		private readonly rejectRestaurantUseCase: IRejectRestaurantUseCase,
		@inject(TYPES.UseCases.ListRestaurantApplicationsUseCase)
		private readonly listRestaurantApplicationsUseCase: IListRestaurantApplicationsUseCase,
		@inject(TYPES.UseCases.GetRestaurantApplicationDetailsUseCase)
		private readonly getRestaurantApplicationDetailsUseCase: IGetRestaurantApplicationDetailsUseCase,
		@inject(TYPES.UseCases.GetRestaurantDetailsUseCase)
		private readonly getRestaurantDetailsUseCase: IGetRestaurantDetailsUseCase,
		@inject(TYPES.UseCases.ListRestaurantsUseCase)
		private readonly listRestaurantsUseCase: IListRestaurantsUseCase,
		@inject(TYPES.UseCases.BlockRestaurantUseCase)
		private readonly blockRestaurantUseCase: IBlockRestaurantUseCase,
		@inject(TYPES.UseCases.UnblockRestaurantUseCase)
		private readonly unblockRestaurantUseCase: IUnblockRestaurantUseCase,
	) {}

	private mapApplicationItemToSnakeCase(
		dto:
			| RestaurantApplicationItemDto
			| RestaurantApplicationDetailsResponseDto,
	) {
		return {
			id: dto.id,
			restaurant_name: dto.restaurantName,
			email: dto.email,
			phone: dto.phone,
			owner_name: dto.ownerName,
			owner_email: dto.ownerEmail,
			status: dto.status,
			onboarding_status: dto.onboardingStatus,
			email_verified_at: dto.emailVerifiedAt ?? null,
			rejection_reason: dto.rejectionReason ?? null,
			created_at: dto.createdAt,
			updated_at: dto.updatedAt,
			address: dto.address
				? {
						id: dto.address.id,
						address_line1: dto.address.addressLine1,
						address_line2: dto.address.addressLine2,
						city: dto.address.city,
						state: dto.address.state,
						country: dto.address.country,
						pincode: dto.address.pincode,
						latitude: dto.address.latitude,
						longitude: dto.address.longitude,
					}
				: null,
			documents: (dto.documents || []).map((doc) => ({
				id: doc.id,
				document_type: doc.documentType,
				document_name: doc.documentName,
				document_key: doc.documentKey,
				verification_status: doc.verificationStatus,
				uploaded_at: doc.uploadedAt,
			})),
			images: (dto.images || []).map((img) => ({
				id: img.id,
				object_key: img.objectKey,
				display_order: img.displayOrder,
				created_at: img.createdAt,
			})),
		};
	}

	private mapBlockUnblockToSnakeCaseResponse(dto: BlockRestaurantResponseDto) {
		return {
			id: dto.id,
			restaurant_name: dto.restaurantName,
			status: dto.status,
			is_blocked: dto.isBlocked,
			block_reason: dto.blockReason,
			updated_at: dto.updatedAt,
		};
	}

	public listRestaurantApplications = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const query = (res.locals.query ??
			req.query) as ListRestaurantApplicationsQuery;

		const result =
			await this.listRestaurantApplicationsUseCase.execute(query);

		return sendSuccessResponse(
			res,
			{
				restaurants: result.restaurants.map((r) =>
					this.mapApplicationItemToSnakeCase(r),
				),
				pagination: result.pagination,
			},
			messages.RESTAURANT_APPLICATIONS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public getRestaurantApplicationDetails = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const { id } = req.params as GetRestaurantApplicationDetailsParam;

		const result =
			await this.getRestaurantApplicationDetailsUseCase.execute({
				restaurantId: id,
			});

		return sendSuccessResponse(
			res,
			this.mapApplicationItemToSnakeCase(result),
			messages.RESTAURANT_APPLICATION_DETAILS_FETCHED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public approveRestaurant = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const { id } = req.params as ApproveRestaurantParams;
		const adminUser = req.user as AuthenticatedAdmin | undefined;
		const adminId = adminUser?.userId ?? req.userId;

		const result = await this.approveRestaurantUseCase.execute({
			restaurantId: id,
			adminId,
		});

		return sendSuccessResponse(
			res,
			{
				id: result.id,
				restaurant_name: result.restaurantName,
				status: result.status,
				reviewed_by: result.reviewedBy,
				reviewed_at: result.reviewedAt,
			},
			messages.RESTAURANT_APPROVED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public rejectRestaurant = async (
		req: Request,
		res: Response,
	): Promise<Response> => {
		const { id } = req.params as RejectRestaurantParams;
		const { reason } = req.body as RejectRestaurantBody;
		const adminUser = req.user as AuthenticatedAdmin | undefined;
		const adminId = adminUser?.userId ?? req.userId;

		const result = await this.rejectRestaurantUseCase.execute({
			restaurantId: id,
			reason,
			adminId,
		});

		return sendSuccessResponse(
			res,
			{
				id: result.id,
				restaurant_name: result.restaurantName,
				status: result.status,
				rejection_reason: result.rejectionReason,
				reviewed_by: result.reviewedBy,
				reviewed_at: result.reviewedAt,
			},
			messages.RESTAURANT_REJECTED_SUCCESS,
			HTTP_STATUS.OK,
		);
	};

	public getRestaurantDetails = async (
		req: Request<GetRestaurantDetailsParam>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const restaurantDetails =
				await this.getRestaurantDetailsUseCase.execute(id);

			sendSuccessResponse(
				res,
				AdminRestaurantResponseMapper.toResponse(restaurantDetails),
				messages.RESTAURANT_DETAILS_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};

	public listRestaurants = async (
		req: Request,
		res: Response,
		next?: NextFunction,
	): Promise<void> => {
		try {
			const query = (res.locals.query ??
				req.query) as ListRestaurantsQuery;

			const result = await this.listRestaurantsUseCase.execute({
				page: query.page,
				limit: query.limit,
				search: query.search,
				status: query.status,
				plan: query.plan,
				isSubscriptionActive: query.isSubscriptionActive,
				createdFrom: query.createdFrom,
				createdTo: query.createdTo,
				sortBy: query.sortBy,
				sortOrder: query.sortOrder,
			});

			sendSuccessResponse(
				res,
				result,
				messages.RESTAURANTS_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			if (next) {
				next(error);
			}
		}
	};

	public blockRestaurant = async (
		req: Request<BlockRestaurantParam, unknown, BlockRestaurantBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const { reason } = req.body;
			const adminId = (req as AuthenticatedAdminRequest).user?.userId;

			const result = await this.blockRestaurantUseCase.execute({
				restaurantId: id,
				reason,
				adminId,
			});

			sendSuccessResponse(
				res,
				this.mapBlockUnblockToSnakeCaseResponse(result),
				messages.RESTAURANT_BLOCKED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};

	public unblockRestaurant = async (
		req: Request<UnblockRestaurantParam>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const adminId = (req as AuthenticatedAdminRequest).user?.userId;

			const result = await this.unblockRestaurantUseCase.execute({
				restaurantId: id,
				adminId,
			});

			sendSuccessResponse(
				res,
				this.mapBlockUnblockToSnakeCaseResponse(result),
				messages.RESTAURANT_UNBLOCKED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
