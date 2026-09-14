import type {
	RestaurantAddressDetail,
	RestaurantDocumentDetail,
	RestaurantImageDetail,
} from "@/application/ports/repositories/restaurant.repository.port.ts";

export interface ListRestaurantApplicationsDto {
	page?: number;
	limit?: number;
	status?: "PENDING" | "REJECTED";
	search?: string;
	fromDate?: Date;
	toDate?: Date;
	sortBy?: "createdAt" | "updatedAt" | "restaurantName" | "status";
	sortOrder?: "asc" | "desc";
}

export interface RestaurantApplicationItemDto {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: string;
	onboardingStatus: string;
	emailVerifiedAt?: Date | null;
	rejectionReason?: string | null;
	createdAt: Date;
	updatedAt: Date;
	address?: RestaurantAddressDetail | null;
	documents?: RestaurantDocumentDetail[];
	images?: RestaurantImageDetail[];
}

export interface PaginatedRestaurantApplicationsResponseDto {
	restaurants: RestaurantApplicationItemDto[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}
