import type {
	RestaurantAddressDetail,
	RestaurantDocumentDetail,
	RestaurantImageDetail,
} from "@/application/ports/repositories/restaurant.repository.port.ts";

export interface GetRestaurantApplicationDetailsDto {
	restaurantId: string;
}

export interface RestaurantApplicationDetailsResponseDto {
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
