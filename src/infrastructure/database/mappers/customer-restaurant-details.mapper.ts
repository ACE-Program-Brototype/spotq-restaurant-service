import { formatTime } from "@utils/time.util";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type {
	CustomerRestaurantAddonRecord,
	CustomerRestaurantDetailsRecord,
	CustomerRestaurantImageRecord,
	CustomerRestaurantMenuCategoryRecord,
	CustomerRestaurantMenuItemRecord,
	CustomerRestaurantOperatingHourRecord,
	CustomerRestaurantVariantRecord,
} from "@/domain/repositories/restaurant.repository.interface.ts";

export interface RawCustomerRestaurantAddon {
	id: string;
	addonId: string;
	priceOverride: unknown | null;
	addon?: {
		id: string;
		name: string;
		description: string | null;
		price: unknown;
		imageKey: string | null;
		isAvailable: boolean;
	} | null;
}

export interface RawCustomerRestaurantVariant {
	id: string;
	sku: string | null;
	name: string;
	price: unknown;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface RawCustomerRestaurantImage {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface RawCustomerRestaurantMenuItem {
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
	images?: RawCustomerRestaurantImage[];
	variants?: RawCustomerRestaurantVariant[];
	addons?: RawCustomerRestaurantAddon[];
}

export interface RawCustomerRestaurantMenuCategory {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number;
	menuItems?: RawCustomerRestaurantMenuItem[];
}

export interface RawCustomerRestaurantDetails {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	status: string;
	isBlocked: boolean;
	isSubscriptionActive: boolean;
	subscriptionEndsAt: Date | null;
	onboardingStatus: string;
	subscriptionPlanCode: string;
	address?: {
		id: string;
		addressLine1: string;
		addressLine2: string | null;
		city: string;
		state: string;
		country: string;
		pincode: string;
		latitude: unknown;
		longitude: unknown;
	} | null;
	profile?: {
		description: string | null;
		cuisineType: string | null;
		averageCost: number | null;
		coverImageKey: string | null;
	} | null;
	settings?: {
		isOpened: boolean;
		isPreorder: boolean;
		acceptsQueue: boolean;
		acceptsQrOrders: boolean;
	} | null;
	operatingHours?: Array<{
		id: string;
		dayOfWeek: number;
		isOpen: boolean;
		isClosed: boolean;
		openTime: Date | string | null;
		closeTime: Date | string | null;
	}>;
	images?: RawCustomerRestaurantImage[];
	menuCategories?: RawCustomerRestaurantMenuCategory[];
}

export const CustomerRestaurantDetailsPersistenceMapper = {
	toRecord(
		raw: RawCustomerRestaurantDetails,
		restaurantEntity: Restaurant,
	): CustomerRestaurantDetailsRecord {

		return {
			id: raw.id,
			restaurantName: raw.restaurantName,
			email: raw.email,
			subscriptionPlanCode: raw.subscriptionPlanCode,
			phone: raw.phone,
			status: raw.status,
			isBlocked: raw.isBlocked,
			isSubscriptionActive: raw.isSubscriptionActive,
			subscriptionEndsAt: raw.subscriptionEndsAt,
			onboardingStatus: raw.onboardingStatus,
			restaurant: restaurantEntity,
			address: raw.address
				? {
						id: raw.address.id,
						addressLine1: raw.address.addressLine1,
						addressLine2: raw.address.addressLine2,
						city: raw.address.city,
						state: raw.address.state,
						country: raw.address.country,
						pincode: raw.address.pincode,
						latitude: raw.address.latitude,
						longitude: raw.address.longitude,
					}
				: null,
			profile: raw.profile
				? {
						description: raw.profile.description,
						cuisineType: raw.profile.cuisineType,
						averageCost: raw.profile.averageCost,
						coverImageKey: raw.profile.coverImageKey,
					}
				: null,
			settings: raw.settings
				? {
						isOpened: raw.settings.isOpened,
						isPreorder: raw.settings.isPreorder,
						acceptsQueue: raw.settings.acceptsQueue,
						acceptsQrOrders: raw.settings.acceptsQrOrders,
					}
				: null,
			operatingHours: (raw.operatingHours || []).map(
				(oh): CustomerRestaurantOperatingHourRecord => ({
					id: oh.id,
					dayOfWeek: oh.dayOfWeek,
					isOpen: oh.isOpen,
					isClosed: oh.isClosed,
					openTime: formatTime(oh.openTime),
					closeTime: formatTime(oh.closeTime),
				}),
			),
			images: (raw.images || []).map(
				(img): CustomerRestaurantImageRecord => ({
					id: img.id,
					objectKey: img.objectKey,
					displayOrder: img.displayOrder,
				}),
			),
			menuCategories: (raw.menuCategories || []).map(
				(cat): CustomerRestaurantMenuCategoryRecord => ({
					id: cat.id,
					name: cat.name,
					description: cat.description,
					displayOrder: cat.displayOrder,
					menuItems: (cat.menuItems || []).map(
						(item): CustomerRestaurantMenuItemRecord => ({
							id: item.id,
							categoryId: item.categoryId,
							name: item.name,
							description: item.description,
							price: item.price,
							preparationTime: item.preparationTime,
							calories: item.calories,
							isVegetarian: item.isVegetarian,
							isFeatured: item.isFeatured,
							isAvailable: item.isAvailable,
							images: item.images || [],
							variants: (item.variants || []).map(
								(v): CustomerRestaurantVariantRecord => ({
									id: v.id,
									sku: v.sku,
									name: v.name,
									price: v.price,
									isDefault: v.isDefault,
									isAvailable: v.isAvailable,
								}),
							),
							addons: (item.addons || []).map(
								(a): CustomerRestaurantAddonRecord => ({
									id: a.id,
									addonId: a.addon?.id ?? a.addonId,
									name: a.addon?.name ?? "",
									description: a.addon?.description ?? null,
									price: a.addon?.price ?? 0,
									priceOverride: a.priceOverride,
									imageKey: a.addon?.imageKey ?? null,
									isAvailable: a.addon?.isAvailable ?? true,
								}),
							),
						}),
					),
				}),
			),
		};
	},
};
