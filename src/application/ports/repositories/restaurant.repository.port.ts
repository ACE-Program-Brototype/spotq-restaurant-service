import type { CreateRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { Restaurant } from "@/domain/entities/restaurant.entity";

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
}
