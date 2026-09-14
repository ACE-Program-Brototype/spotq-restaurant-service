import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { RestaurantApplicationItemDto } from "@/application/dtos/admin/list-restaurant-applications.dto.ts";
import type { RestaurantApplicationDetailsResponseDto } from "@/application/dtos/admin/get-restaurant-application-details.dto.ts";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { ApproveRestaurantParams } from "@/presentation/http/validators/admin/approve-restaurant.validator.ts";
import type { GetRestaurantApplicationDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-application-details.validator.ts";
import type { ListRestaurantApplicationsQuery } from "@/presentation/http/validators/admin/list-restaurant-applications.validator.ts";
import type {
	RejectRestaurantBody,
	RejectRestaurantParams,
} from "@/presentation/http/validators/admin/reject-restaurant.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedAdmin } from "@/types/express.d.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.ApproveRestaurantUseCase)
		private readonly approveRestaurantUseCase: IApproveRestaurantUseCase,
		@inject(TYPES.RejectRestaurantUseCase)
		private readonly rejectRestaurantUseCase: IRejectRestaurantUseCase,
		@inject(TYPES.ListRestaurantApplicationsUseCase)
		private readonly listRestaurantApplicationsUseCase: IListRestaurantApplicationsUseCase,
		@inject(TYPES.GetRestaurantApplicationDetailsUseCase)
		private readonly getRestaurantApplicationDetailsUseCase: IGetRestaurantApplicationDetailsUseCase,
	) {}

	private mapApplicationItemToSnakeCase(
		dto: RestaurantApplicationItemDto | RestaurantApplicationDetailsResponseDto,
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

	async listRestaurantApplications(
		req: Request,
		res: Response,
	): Promise<Response> {
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
	}

	async getRestaurantApplicationDetails(
		req: Request,
		res: Response,
	): Promise<Response> {
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
	}

	async approveRestaurant(req: Request, res: Response): Promise<Response> {
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
	}

	async rejectRestaurant(req: Request, res: Response): Promise<Response> {
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
	}
}
