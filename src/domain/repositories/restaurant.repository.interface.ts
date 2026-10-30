import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";
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

export interface CustomerRestaurantFilterParams {
	page: number;
	limit: number;
	search?: string;
	city?: string;
	cuisine?: string;
	foodItem?: string;
	minRating?: number;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: string;
	sortOrder: "asc" | "desc";
}

export interface CustomerRestaurantListItem {
	id: string;
	restaurantName: string;
	city: string | null;
	state: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImageKey: string | null;
	createdAt: Date;
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

export interface CreateRestaurantData {
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	emailVerifiedAt: Date;
}

export interface OnboardDocumentItemData {
	documentName: string;
	documentKey: string;
}

export interface OnboardDocumentsData {
	fssai: OnboardDocumentItemData;
	businessRegistration: OnboardDocumentItemData;
	ownerIdentity: OnboardDocumentItemData;
	gst: OnboardDocumentItemData;
	businessPan: OnboardDocumentItemData;
}

export interface OnboardImageData {
	objectKey: string;
	fileName?: string;
	displayOrder: number;
}

export interface OnboardLocationData {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number;
	longitude: number;
}

export interface OnboardRestaurantData {
	restaurantName: string;
	phone: string;
	ownerName: string;
	seatingCapacity?: number;
	documents?: OnboardDocumentsData;
	restaurantImages?: OnboardImageData[];
	location?: OnboardLocationData;
}

export interface RestaurantCompletedDetailsAddress {
	id: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number;
	longitude: number;
}

export interface RestaurantCompletedDetailsStaffMember {
	id: string;
	fullname: string;
	email: string;
	phone: string;
	role: string;
	status: string;
	avatarUrl: string | null;
	createdAt: Date;
}

export interface RestaurantCompletedDetailsDocument {
	id: string;
	documentType: string;
	documentName: string;
	documentKey: string;
	verificationStatus: string;
	uploadedAt: Date;
}

export interface RestaurantCompletedDetailsImage {
	id: string;
	objectKey: string;
	displayOrder: number;
	createdAt: Date;
}

export interface RestaurantCompletedDetailsOperatingHour {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	openTime: Date | null;
	closeTime: Date | null;
}

export interface RestaurantCompletedDetailsSettings {
	isOpened: boolean;
	isPreorder: boolean;
	isLoyaltyEnabled: boolean;
	cuisineType: string | null;
	seatingCapacity: number | null;
	openTime: Date | null;
	closeTime: Date | null;
}

export interface RestaurantCompletedDetailsProfile {
	coverImage: string | null;
	avatar: string | null;
	description: string | null;
	fssaiNumber: string | null;
	registerNumber: string | null;
	gstNumber: string | null;
}

export interface RestaurantCompletedDetailsLinkedAccount {
	email: string;
	phone: string;
	isEmailVerified: boolean;
	lastLoginAt: Date | null;
}

export interface RestaurantCompletedDetails {
	id: string;
	restaurantName: string;
	category: string | null;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: string;
	onboardingStatus: string;
	isBlocked: boolean;
	blockReason: string | null;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: Date | null;
	lastLoginAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	address: RestaurantCompletedDetailsAddress | null;
	settings: RestaurantCompletedDetailsSettings | null;
	profile: RestaurantCompletedDetailsProfile | null;
	operatingHours: RestaurantCompletedDetailsOperatingHour[];
	staff: RestaurantCompletedDetailsStaffMember[];
	documents: RestaurantCompletedDetailsDocument[];
	images: RestaurantCompletedDetailsImage[];
	linkedAccount: RestaurantCompletedDetailsLinkedAccount;
}

export interface RestaurantProfileItemDetails {
	id?: string;
	name: string;
	phone: string;
	ownerName: string;
}

export interface RestaurantProfileSectionDetails {
	logo: string | null;
	avatarUpdatedAt?: Date | null;
	coverImage: string | null;
	description: string | null;
	cuisineType: string | null;
	averageCost: number;
}

export interface RestaurantProfileSettingsDetails {
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
	loyaltyEnabled: boolean;
	autoAcceptQueue: boolean;
	seatingCapacity: number;
}

export interface RestaurantProfileBusinessHoursDetails {
	dayOfWeek: number;
	openTime: string | null;
	closeTime: string | null;
	isClosed: boolean;
}

export interface RestaurantProfileDetails {
	restaurant: RestaurantProfileItemDetails;
	profile: RestaurantProfileSectionDetails;
	settings: RestaurantProfileSettingsDetails;
	businessHours: RestaurantProfileBusinessHoursDetails[];
}

export interface UpdateRestaurantProfileData {
	restaurant?: {
		name?: string;
		phone?: string;
		ownerName?: string;
	};
	profile?: {
		avatarUpdatedAt?: Date | null;
		hasAvatar?: boolean | null;
		logoKey?: string | null;
		coverImageKey?: string | null;
		description?: string | null;
		cuisineType?: string | null;
		averageCost?: number;
	};
	settings?: {
		isOpened?: boolean;
		isPreorder?: boolean;
		seatingCapacity?: number;
		acceptsQueue?: boolean;
		acceptsQrOrders?: boolean;
		loyaltyEnabled?: boolean;
		autoAcceptQueue?: boolean;
	};
	businessHours?: Array<{
		dayOfWeek: number;
		openTime?: string | null;
		closeTime?: string | null;
		isClosed?: boolean;
	}>;
}

export interface IRestaurantRepository
	extends IBaseRepository<Restaurant, string> {
	getRestaurantAvailabilitySettings(
		restaurantId: string,
	): Promise<{ isOpened: boolean; acceptsQueue: boolean } | null>;

	create(data: Partial<Restaurant>): Promise<Restaurant>;

	createRestaurant(data: CreateRestaurantData): Promise<Restaurant>;

	existsByEmail(email: string): Promise<boolean>;

	findByEmail(email: string): Promise<Restaurant | null>;

	findApplicationsWithFilters(
		params: RestaurantApplicationFilterParams,
	): Promise<{ restaurants: RestaurantApplicationDetail[]; total: number }>;

	findByIdWithDetails(id: string): Promise<RestaurantApplicationDetail | null>;

	findCompletedDetailsById(
		id: string,
	): Promise<RestaurantCompletedDetails | null>;

	updateLastLogin(id: string, date?: Date): Promise<void>;

	findManyWithFilters(
		params: RestaurantFilterParams,
	): Promise<{ restaurants: Restaurant[]; total: number }>;

	save(restaurant: Restaurant): Promise<void>;

	update(id: string, data: Partial<Restaurant>): Promise<Restaurant>;

	activateSubscription(
		restaurantId: string,
		planCode: string,
		currentPeriodEnd: Date,
		eventId: string,
	): Promise<boolean>;

	completeOnboarding(
		restaurant: Restaurant,
		dto: OnboardRestaurantData,
	): Promise<Restaurant>;

	getRestaurantProfileDetails(
		restaurantId: string,
	): Promise<RestaurantProfileDetails | null>;

	updateProfileDetails(
		restaurantId: string,
		data: UpdateRestaurantProfileData,
	): Promise<RestaurantProfileDetails>;

	findCustomerRestaurants(
		params: CustomerRestaurantFilterParams,
	): Promise<{ restaurants: CustomerRestaurantListItem[]; total: number }>;

	findValidationDetailsById(
		restaurantId: string,
	): Promise<RestaurantValidationRecord | null>;

	findCustomerRestaurantDetails(
		params: CustomerRestaurantDetailsQueryParams,
	): Promise<CustomerRestaurantDetailsRecord | null>;
}

export interface CustomerRestaurantDetailsQueryParams {
	restaurantId: string;
	includeMenu?: boolean;
	categoryId?: string;
}

export interface CustomerRestaurantAddressRecord {
	id: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number | null;
	longitude: number | null;
}

export interface CustomerRestaurantProfileRecord {
	description: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImageKey: string | null;
}

export interface CustomerRestaurantSettingsRecord {
	isOpened: boolean;
	isPreorder: boolean;
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
}

export interface CustomerRestaurantOperatingHourRecord {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	isClosed: boolean;
	openTime: string | null;
	closeTime: string | null;
}

export interface CustomerRestaurantImageRecord {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerRestaurantVariantRecord {
	id: string;
	sku: string | null;
	name: string;
	price: unknown;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface CustomerRestaurantAddonRecord {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: unknown;
	priceOverride: unknown | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface CustomerRestaurantMenuItemRecord {
	id: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: unknown;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: CustomerRestaurantImageRecord[];
	variants: CustomerRestaurantVariantRecord[];
	addons: CustomerRestaurantAddonRecord[];
}

export interface CustomerRestaurantMenuCategoryRecord {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number;
	menuItems: CustomerRestaurantMenuItemRecord[];
}

export interface CustomerRestaurantDetailsRecord {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	status: string;
	isBlocked: boolean;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string;
	subscriptionEndsAt: Date | null;
	onboardingStatus: string;
	restaurant: Restaurant;
	address: CustomerRestaurantAddressRecord | null;
	profile: CustomerRestaurantProfileRecord | null;
	settings: CustomerRestaurantSettingsRecord | null;
	operatingHours: CustomerRestaurantOperatingHourRecord[];
	images: CustomerRestaurantImageRecord[];
	menuCategories: CustomerRestaurantMenuCategoryRecord[];
}

export interface RestaurantValidationRecord {
	restaurant: Restaurant;
	acceptsQueue: boolean;
}
