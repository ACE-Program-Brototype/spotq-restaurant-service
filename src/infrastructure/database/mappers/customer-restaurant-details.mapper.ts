import type { Prisma } from "@prisma/client";
import type { CustomerRestaurantDetailsRecord } from "@/domain/repositories/restaurant.repository.interface.ts";

export interface RawCustomerRestaurantAddon {
	id: string;
	priceOverride: number | Prisma.Decimal | null;
	addon?: {
		id: string;
		name: string;
		description: string | null;
		price: number | Prisma.Decimal;
		imageKey: string | null;
		isAvailable: boolean;
	};
	addonId?: string;
	name?: string;
	description?: string | null;
	price?: number | Prisma.Decimal;
	imageKey?: string | null;
	isAvailable?: boolean;
}

export interface RawCustomerRestaurantVariant {
	id: string;
	sku: string | null;
	name: string;
	price: number | Prisma.Decimal;
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
	price: number | Prisma.Decimal;
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

export interface RawCustomerRestaurantAddress {
	id: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number | Prisma.Decimal | string;
	longitude: number | Prisma.Decimal | string;
}

export interface RawCustomerRestaurantProfile {
	description: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImageKey: string | null;
}

export interface RawCustomerRestaurantSettings {
	isOpened: boolean;
	isPreorder: boolean;
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
}

export interface RawCustomerRestaurantOperatingHour {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	isClosed: boolean;
	openTime: Date | string | null;
	closeTime: Date | string | null;
}

export interface RawCustomerRestaurantDetails {
	id: string;
	restaurantName: string;
	email: string;
	phone: string;
	status: string;
	isBlocked: boolean;
	isSubscriptionActive: boolean;
	onboardingStatus: string;
	address?: RawCustomerRestaurantAddress | null;
	profile?: RawCustomerRestaurantProfile | null;
	settings?: RawCustomerRestaurantSettings | null;
	operatingHours?: RawCustomerRestaurantOperatingHour[];
	images?: RawCustomerRestaurantImage[];
	menuCategories?: RawCustomerRestaurantMenuCategory[];
}

export const CustomerRestaurantDetailsPersistenceMapper = {
	toRecord(raw: RawCustomerRestaurantDetails): CustomerRestaurantDetailsRecord {
		const address = raw.address
			? {
					id: raw.address.id,
					addressLine1: raw.address.addressLine1,
					addressLine2: raw.address.addressLine2,
					city: raw.address.city,
					state: raw.address.state,
					country: raw.address.country,
					pincode: raw.address.pincode,
					latitude: Number(raw.address.latitude),
					longitude: Number(raw.address.longitude),
				}
			: null;

		const profile = raw.profile
			? {
					description: raw.profile.description,
					cuisineType: raw.profile.cuisineType,
					averageCost: raw.profile.averageCost,
					coverImageKey: raw.profile.coverImageKey,
				}
			: null;

		const settings = raw.settings
			? {
					isOpened: raw.settings.isOpened,
					isPreorder: raw.settings.isPreorder,
					acceptsQueue: raw.settings.acceptsQueue,
					acceptsQrOrders: raw.settings.acceptsQrOrders,
				}
			: null;

		const menuCategories = (raw.menuCategories || []).map((cat) => ({
			id: cat.id,
			name: cat.name,
			description: cat.description,
			displayOrder: cat.displayOrder,
			menuItems: (cat.menuItems || []).map((item) => ({
				id: item.id,
				categoryId: item.categoryId,
				name: item.name,
				description: item.description,
				price: Number(item.price),
				preparationTime: item.preparationTime,
				calories: item.calories,
				isVegetarian: item.isVegetarian,
				isFeatured: item.isFeatured,
				isAvailable: item.isAvailable,
				images: item.images || [],
				variants: (item.variants || []).map((v) => ({
					id: v.id,
					sku: v.sku,
					name: v.name,
					price: Number(v.price),
					isDefault: v.isDefault,
					isAvailable: v.isAvailable,
				})),
				addons: (item.addons || []).map((a) => ({
					id: a.id,
					addonId: a.addon ? a.addon.id : (a.addonId ?? a.id),
					name: a.addon ? a.addon.name : (a.name ?? ""),
					description: a.addon ? a.addon.description : (a.description ?? null),
					price: Number(a.addon ? a.addon.price : (a.price ?? 0)),
					priceOverride:
						a.priceOverride != null ? Number(a.priceOverride) : null,
					imageKey: a.addon ? a.addon.imageKey : (a.imageKey ?? null),
					isAvailable: a.addon ? a.addon.isAvailable : (a.isAvailable ?? true),
				})),
			})),
		}));

		return {
			id: raw.id,
			restaurantName: raw.restaurantName,
			email: raw.email,
			phone: raw.phone,
			status: raw.status,
			isBlocked: raw.isBlocked,
			isSubscriptionActive: raw.isSubscriptionActive,
			onboardingStatus: raw.onboardingStatus,
			address,
			profile,
			settings,
			operatingHours: raw.operatingHours || [],
			images: raw.images || [],
			menuCategories,
		};
	},
};
