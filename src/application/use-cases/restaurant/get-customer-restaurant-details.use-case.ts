import { inject, injectable } from "inversify";
import type {
	CustomerRestaurantDetailsInputDto,
	CustomerRestaurantDetailsOutputDto,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CustomerRestaurantDetailsRecord,
	IRestaurantRepository,
} from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetCustomerRestaurantDetailsUseCase {
	constructor(
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: CustomerRestaurantDetailsInputDto,
	): Promise<CustomerRestaurantDetailsOutputDto> {
		const includeMenu = dto.includeMenu ?? true;

		const record =
			await this.restaurantRepository.findCustomerRestaurantDetails({
				restaurantId: dto.restaurantId,
				includeMenu,
				categoryId: dto.categoryId,
			});

		if (!record) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		this.ensureRestaurantIsEligible(record);

		const menu = includeMenu
			? record.menuCategories.map((cat) => ({
					id: cat.id,
					name: cat.name,
					description: cat.description,
					displayOrder: cat.displayOrder,
					items: cat.menuItems.map((item) => ({
						id: item.id,
						name: item.name,
						description: item.description,
						price: Number(item.price),
						preparationTime: item.preparationTime,
						calories: item.calories,
						isVegetarian: item.isVegetarian,
						isFeatured: item.isFeatured,
						isAvailable: item.isAvailable,
						images: item.images.map((img) => ({
							id: img.id,
							objectKey: img.objectKey,
							displayOrder: img.displayOrder,
						})),
						variants: item.variants.map((v) => ({
							id: v.id,
							sku: v.sku,
							name: v.name,
							price: Number(v.price),
							isDefault: v.isDefault,
							isAvailable: v.isAvailable,
						})),
						addons: item.addons.map((a) => ({
							id: a.id,
							addonId: a.addonId,
							name: a.name,
							description: a.description,
							price: Number(a.price),
							priceOverride:
								a.priceOverride != null ? Number(a.priceOverride) : null,
							imageKey: a.imageKey,
							isAvailable: a.isAvailable,
						})),
					})),
				}))
			: [];

		return {
			id: record.id,
			restaurantName: record.restaurantName,
			phone: record.phone,
			email: record.email,
			description: record.profile?.description ?? null,
			cuisineType: record.profile?.cuisineType ?? null,
			averageCost: record.profile?.averageCost ?? null,
			coverImage:
				record.profile?.coverImageKey ?? record.images?.[0]?.objectKey ?? null,
			address: record.address
				? {
						id: record.address.id,
						addressLine1: record.address.addressLine1,
						addressLine2: record.address.addressLine2,
						city: record.address.city,
						state: record.address.state,
						country: record.address.country,
						pincode: record.address.pincode,
						latitude: Number(record.address.latitude),
						longitude: Number(record.address.longitude),
					}
				: null,
			settings: record.settings
				? {
						isOpened: record.settings.isOpened,
						isPreorder: record.settings.isPreorder,
						acceptsQueue: record.settings.acceptsQueue,
						acceptsQrOrders: record.settings.acceptsQrOrders,
					}
				: null,
			operatingHours: record.operatingHours.map((oh) => ({
				id: oh.id,
				dayOfWeek: oh.dayOfWeek,
				isOpen: oh.isOpen,
				isClosed: oh.isClosed,
				openTime:
					oh.openTime instanceof Date
						? oh.openTime.toISOString()
						: oh.openTime != null
							? String(oh.openTime)
							: null,
				closeTime:
					oh.closeTime instanceof Date
						? oh.closeTime.toISOString()
						: oh.closeTime != null
							? String(oh.closeTime)
							: null,
			})),
			images: record.images.map((img) => ({
				id: img.id,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
			})),
			menu,
		};
	}

	private ensureRestaurantIsEligible(
		record: CustomerRestaurantDetailsRecord,
	): void {
		if (
			record.status !== "ACTIVE" ||
			record.isBlocked ||
			!record.isSubscriptionActive ||
			record.onboardingStatus !== "COMPLETED"
		) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}
	}
}
