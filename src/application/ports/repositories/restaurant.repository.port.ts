import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type {
	CreateRestaurantDto,
	OnboardRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto.ts";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { Restaurant } from "@/domain/entities/restaurant.entity";
import type { RestaurantStatus } from "@/domain/value-objects/restaurant-status.vo.ts";
import type { SubscriptionPlan } from "@/domain/value-objects/subscription-plan.vo.ts";

export interface RestaurantFilterParams {
	page: number;
	limit: number;
	search?: string;
	status?: RestaurantStatus;
	plan?: SubscriptionPlan;
	isSubscriptionActive?: boolean;
	createdFrom?: Date;
	createdTo?: Date;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export interface RestaurantApplicationFilterParams {
	page: number;
	limit: number;
	status?: "PENDING" | "REJECTED";
	search?: string;
	fromDate?: Date;
	toDate?: Date;
	sortBy: "createdAt" | "updatedAt" | "restaurantName" | "status";
	sortOrder: "asc" | "desc";
}

export interface RestaurantAddressDetail {
	id: string;
	restaurantId: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number | string;
	longitude: number | string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RestaurantDocumentDetail {
	id: string;
	restaurantId: string;
	documentType: string;
	documentName: string;
	documentKey: string;
	verificationStatus: string;
	uploadedAt: Date;
}

export interface RestaurantImageDetail {
	id: string;
	restaurantId: string;
	objectKey: string;
	displayOrder: number;
	createdAt: Date;
}

export interface RestaurantApplicationDetail {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: string;
	onboardingStatus: string;
	emailVerifiedAt: Date | null;
	rejectionReason: string | null;
	createdAt: Date;
	updatedAt: Date;
	address: RestaurantAddressDetail | null;
	documents: RestaurantDocumentDetail[];
	images: RestaurantImageDetail[];
}

export interface IRestaurantRepository extends IBaseRepository<Restaurant> {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;

	findByEmail(email: string): Promise<Restaurant | null>;

	findApplicationsWithFilters(
		params: RestaurantApplicationFilterParams,
	): Promise<{ restaurants: RestaurantApplicationDetail[]; total: number }>;

	findByIdWithDetails(id: string): Promise<RestaurantApplicationDetail | null>;

	findCompletedDetailsById(
		id: string,
	): Promise<RestaurantDetailsResponseDto | null>;

	updateLastLogin(id: string, date?: Date): Promise<void>;

	findManyWithFilters(
		params: RestaurantFilterParams,
	): Promise<{ restaurants: Restaurant[]; total: number }>;

	save(restaurant: Restaurant): Promise<void>;

	activateSubscription(
		restaurantId: string,
		planCode: string,
		currentPeriodEnd: Date,
		eventId: string,
	): Promise<boolean>;

	completeOnboarding(
		restaurant: Restaurant,
		dto: OnboardRestaurantDto,
	): Promise<Restaurant>;

	getRestaurantProfileDetails(
		restaurantId: string,
	): Promise<RestaurantProfileResponseDto | null>;

	updateProfileDetails(
		restaurantId: string,
		data: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto>;
}
