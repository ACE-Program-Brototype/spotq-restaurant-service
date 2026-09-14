import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type {
	BlockRestaurantResponseDto,
} from "@/application/dtos/admin/block-restaurant.dto.ts";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { AuthenticatedAdminRequest } from "@/presentation/http/middleware/admin.auth.middleware.ts";
import type {
	BlockRestaurantBody,
	BlockRestaurantParam,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";
import type { GetRestaurantDetailsParam } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";
import type { UnblockRestaurantParam } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

@injectable()
export class AdminRestaurantController {
	constructor(
		@inject(TYPES.UseCases.GetRestaurantDetailsUseCase)
		private readonly getRestaurantDetailsUseCase: IGetRestaurantDetailsUseCase,
		@inject(TYPES.UseCases.BlockRestaurantUseCase)
		private readonly blockRestaurantUseCase: IBlockRestaurantUseCase,
		@inject(TYPES.UseCases.UnblockRestaurantUseCase)
		private readonly unblockRestaurantUseCase: IUnblockRestaurantUseCase,
	) {}

	private mapBlockUnblockToSnakeCaseResponse(
		dto: BlockRestaurantResponseDto,
	) {
		return {
			id: dto.id,
			restaurant_name: dto.restaurantName,
			status: dto.status,
			is_blocked: dto.isBlocked,
			block_reason: dto.blockReason,
			updated_at: dto.updatedAt,
		};
	}

	private mapToSnakeCaseResponse(dto: RestaurantDetailsResponseDto) {
		return {
			id: dto.id,
			restaurant_name: dto.restaurantName,
			category: dto.category,
			email: dto.email,
			phone: dto.phone,
			owner_name: dto.ownerName,
			owner_email: dto.ownerEmail,
			status: dto.status,
			onboarding_status: dto.onboardingStatus,
			is_blocked: dto.isBlocked,
			block_reason: dto.blockReason,
			is_subscription_active: dto.isSubscriptionActive,
			subscription_plan_code: dto.subscriptionPlanCode,
			subscription_ends_at: dto.subscriptionEndsAt,
			last_login_at: dto.lastLoginAt,
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
			settings: dto.settings
				? {
						is_opened: dto.settings.isOpened,
						is_preorder: dto.settings.isPreorder,
						is_loyalty: dto.settings.isLoyaltyEnabled,
						cuisine_type: dto.settings.cuisineType,
						seating_capacity: dto.settings.seatingCapacity,
						open_time: dto.settings.openTime,
						close_time: dto.settings.closeTime,
					}
				: null,
			profile: dto.profile
				? {
						cover_image: dto.profile.coverImage,
						avatar: dto.profile.avatar,
						description: dto.profile.description,
						fssai_number: dto.profile.fssaiNumber,
						register_number: dto.profile.registerNumber,
						gst_number: dto.profile.gstNumber,
					}
				: null,
			operating_hours: (dto.operatingHours || []).map((oh) => ({
				id: oh.id,
				day_of_week: oh.dayOfWeek,
				is_open: oh.isOpen,
				open_time: oh.openTime,
				close_time: oh.closeTime,
			})),
			staff: (dto.staff || []).map((s) => ({
				id: s.id,
				fullname: s.fullname,
				email: s.email,
				phone: s.phone,
				role: s.role,
				status: s.status,
				avatar_url: s.avatarUrl,
				created_at: s.createdAt,
			})),
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
			linked_account: {
				email: dto.linkedAccount.email,
				phone: dto.linkedAccount.phone,
				is_email_verified: dto.linkedAccount.isEmailVerified,
				last_login_at: dto.linkedAccount.lastLoginAt,
			},
		};
	}

	getRestaurantDetails = async (
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
				this.mapToSnakeCaseResponse(restaurantDetails),
				messages.RESTAURANT_DETAILS_FETCHED_SUCCESS,
				HTTP_STATUS.OK,
			);
		} catch (error) {
			next(error);
		}
	};

	blockRestaurant = async (
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

	unblockRestaurant = async (
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

