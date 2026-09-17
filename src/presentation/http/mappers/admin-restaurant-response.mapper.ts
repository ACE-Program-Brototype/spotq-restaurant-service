import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";

export const AdminRestaurantResponseMapper = {
	toResponse(dto: RestaurantDetailsResponseDto) {
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
	},
};
