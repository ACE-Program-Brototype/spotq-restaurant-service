import type {
	CustomerRestaurantAddressDTO,
	CustomerRestaurantDetailsOutputDTO,
	CustomerRestaurantImageDTO,
	CustomerRestaurantMenuCategoryDTO,
	CustomerRestaurantMenuItemDTO,
	CustomerRestaurantOperatingHourDTO,
	CustomerRestaurantQueueStatusDTO,
	CustomerRestaurantSettingsDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import type {
	CustomerRestaurantAddressRecord,
	CustomerRestaurantDetailsRecord,
	CustomerRestaurantImageRecord,
	CustomerRestaurantMenuCategoryRecord,
	CustomerRestaurantOperatingHourRecord,
	CustomerRestaurantSettingsRecord,
} from "@/domain/repositories/restaurant.repository.interface.ts";

export const CustomerRestaurantDetailsMapper = {
	toDTO(
		record: CustomerRestaurantDetailsRecord,
		includeMenu: boolean,
		queueStatus: CustomerRestaurantQueueStatusDTO | null = null,
	): CustomerRestaurantDetailsOutputDTO {
		return {
			restaurantId: record.id,
			restaurantName: record.restaurantName,
			phone: record.phone,
			email: record.email,
			type: record.subscriptionPlanCode,
			description: record.profile?.description ?? null,
			cuisineType: record.profile?.cuisineType ?? null,
			averageCost: record.profile?.averageCost ?? null,
			coverImage:
				record.profile?.coverImageKey ?? record.images?.[0]?.objectKey ?? null,
			address: this.mapAddress(record.address),
			settings: this.mapSettings(record.settings),
			operatingHours: this.mapOperatingHours(record.operatingHours),
			images: this.mapImages(record.images),
			menu: includeMenu ? this.mapMenu(record.menuCategories) : [],
			queue: queueStatus,
		};
	},

	mapAddress(
		address: CustomerRestaurantAddressRecord | null,
	): CustomerRestaurantAddressDTO | null {
		if (!address) return null;
		return {
			id: address.id,
			addressLine1: address.addressLine1,
			addressLine2: address.addressLine2,
			city: address.city,
			state: address.state,
			country: address.country,
			pincode: address.pincode,
			latitude: address.latitude ? Number(address.latitude) : null,
			longitude: address.longitude ? Number(address.longitude) : null,
		};
	},

	mapSettings(
		settings: CustomerRestaurantSettingsRecord | null,
	): CustomerRestaurantSettingsDTO | null {
		if (!settings) return null;
		return {
			isOpened: settings.isOpened,
			isPreorder: settings.isPreorder,
			acceptsQueue: settings.acceptsQueue,
			acceptsQrOrders: settings.acceptsQrOrders,
		};
	},

	mapOperatingHours(
		hours: CustomerRestaurantOperatingHourRecord[],
	): CustomerRestaurantOperatingHourDTO[] {
		return (hours || []).map((h) => ({
			id: h.id,
			dayOfWeek: h.dayOfWeek,
			isOpen: h.isOpen,
			openTime: h.openTime ?? null,
			closeTime: h.closeTime ?? null,
		}));
	},

	mapImages(
		images: CustomerRestaurantImageRecord[],
	): CustomerRestaurantImageDTO[] {
		return (images || []).map((img) => ({
			id: img.id,
			objectKey: img.objectKey,
			displayOrder: img.displayOrder,
		}));
	},

	mapMenu(
		categories: CustomerRestaurantMenuCategoryRecord[],
	): CustomerRestaurantMenuCategoryDTO[] {
		return (categories || []).map((cat) => ({
			id: cat.id,
			name: cat.name,
			description: cat.description,
			displayOrder: cat.displayOrder,
			items: (cat.menuItems || []).map(
				(item): CustomerRestaurantMenuItemDTO => ({
					id: item.id,
					name: item.name,
					description: item.description,
					price: Number(item.price),
					preparationTime: item.preparationTime,
					calories: item.calories,
					isVegetarian: item.isVegetarian,
					isFeatured: item.isFeatured,
					isAvailable: item.isAvailable,
					images: (item.images || []).map((img) => ({
						id: img.id,
						objectKey: img.objectKey,
						displayOrder: img.displayOrder,
					})),
					variants: (item.variants || []).map((v) => ({
						id: v.id,
						name: v.name,
						price: Number(v.price),
						isDefault: v.isDefault,
						isAvailable: v.isAvailable,
					})),
					addons: (item.addons || []).map((a) => ({
						id: a.id,
						addonId: a.addonId,
						name: a.name,
						description: a.description,
						price:
							a.priceOverride != null
								? Number(a.priceOverride)
								: Number(a.price),
						imageKey: a.imageKey,
						isAvailable: a.isAvailable,
					})),
				}),
			),
		}));
	},
};
