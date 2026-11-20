import { describe, expect, it } from "@jest/globals";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import { AdminRestaurantResponseMapper } from "@/presentation/http/mappers/admin-restaurant-response.mapper.ts";

describe("AdminRestaurantResponseMapper", () => {
	const sampleDto: RestaurantDetailsResponseDto = {
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		restaurantName: "Spice Bistro",
		category: "North Indian",
		email: "info@spicebistro.com",
		phone: "+919876543210",
		ownerName: "John Doe",
		ownerEmail: "john@spicebistro.com",
		status: "APPROVED",
		onboardingStatus: "COMPLETED",
		isBlocked: false,
		blockReason: null,
		isSubscriptionActive: true,
		subscriptionPlanCode: "PREMIUM",
		subscriptionEndsAt: new Date("2026-12-31T23:59:59.999Z"),
		lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		address: {
			id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			addressLine1: "123 Food Street",
			addressLine2: "Suite 4B",
			city: "Kochi",
			state: "Kerala",
			country: "India",
			pincode: "682001",
			latitude: 9.9312,
			longitude: 76.2673,
		},
		settings: {
			isOpened: true,
			isPreorder: false,
			isLoyaltyEnabled: true,
			cuisineType: "North Indian",
			seatingCapacity: 60,
			openTime: new Date("1970-01-01T09:00:00.000Z"),
			closeTime: new Date("1970-01-01T22:00:00.000Z"),
		},
		profile: {
			coverImage: "restaurants/cover.jpg",
			avatar: "restaurants/avatar.jpg",
			description: "Authentic Dining",
			fssaiNumber: "12345678901234",
			registerNumber: "REG-998877",
			gstNumber: "32ABCDE1234F1Z5",
		},
		operatingHours: [
			{
				id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
				dayOfWeek: 1,
				isOpen: true,
				openTime: new Date("1970-01-01T09:00:00.000Z"),
				closeTime: new Date("1970-01-01T22:00:00.000Z"),
			},
		],
		staff: [
			{
				id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
				fullname: "Bob Chef",
				email: "bob@spicebistro.com",
				phone: "+919876543211",
				role: "STAFF",
				status: "ACTIVE",
				avatarUrl: "staff/bob.jpg",
				createdAt: new Date("2026-01-05T00:00:00.000Z"),
			},
		],
		documents: [
			{
				id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
				documentType: "FSSAI",
				documentName: "fssai_cert.pdf",
				documentKey: "docs/fssai.pdf",
				verificationStatus: "VERIFIED",
				uploadedAt: new Date("2026-01-02T00:00:00.000Z"),
			},
		],
		images: [
			{
				id: "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
				objectKey: "images/interior.jpg",
				displayOrder: 1,
				createdAt: new Date("2026-01-03T00:00:00.000Z"),
			},
		],
		linkedAccount: {
			email: "john@spicebistro.com",
			phone: "+919876543210",
			isEmailVerified: true,
			lastLoginAt: new Date("2026-03-01T10:00:00.000Z"),
		},
	};

	it("should map complete RestaurantDetailsResponseDto to snake_case response format", () => {
		const result = AdminRestaurantResponseMapper.toResponse(sampleDto);

		expect(result).toEqual({
			id: sampleDto.id,
			restaurant_name: sampleDto.restaurantName,
			category: sampleDto.category,
			email: sampleDto.email,
			phone: sampleDto.phone,
			owner_name: sampleDto.ownerName,
			owner_email: sampleDto.ownerEmail,
			status: sampleDto.status,
			onboarding_status: sampleDto.onboardingStatus,
			is_blocked: sampleDto.isBlocked,
			block_reason: sampleDto.blockReason,
			is_subscription_active: sampleDto.isSubscriptionActive,
			subscription_plan_code: sampleDto.subscriptionPlanCode,
			subscription_ends_at: sampleDto.subscriptionEndsAt,
			last_login_at: sampleDto.lastLoginAt,
			created_at: sampleDto.createdAt,
			updated_at: sampleDto.updatedAt,
			address: {
				id: sampleDto.address?.id,
				address_line1: sampleDto.address?.addressLine1,
				address_line2: sampleDto.address?.addressLine2,
				city: sampleDto.address?.city,
				state: sampleDto.address?.state,
				country: sampleDto.address?.country,
				pincode: sampleDto.address?.pincode,
				latitude: sampleDto.address?.latitude,
				longitude: sampleDto.address?.longitude,
			},
			settings: {
				is_opened: sampleDto.settings?.isOpened,
				is_preorder: sampleDto.settings?.isPreorder,
				is_loyalty: sampleDto.settings?.isLoyaltyEnabled,
				cuisine_type: sampleDto.settings?.cuisineType,
				seating_capacity: sampleDto.settings?.seatingCapacity,
				open_time: sampleDto.settings?.openTime,
				close_time: sampleDto.settings?.closeTime,
			},
			profile: {
				cover_image: sampleDto.profile?.coverImage,
				avatar: sampleDto.profile?.avatar,
				description: sampleDto.profile?.description,
				fssai_number: sampleDto.profile?.fssaiNumber,
				register_number: sampleDto.profile?.registerNumber,
				gst_number: sampleDto.profile?.gstNumber,
			},
			operating_hours: [
				{
					id: sampleDto.operatingHours[0].id,
					day_of_week: sampleDto.operatingHours[0].dayOfWeek,
					is_open: sampleDto.operatingHours[0].isOpen,
					open_time: sampleDto.operatingHours[0].openTime,
					close_time: sampleDto.operatingHours[0].closeTime,
				},
			],
			staff: [
				{
					id: sampleDto.staff[0].id,
					fullname: sampleDto.staff[0].fullname,
					email: sampleDto.staff[0].email,
					phone: sampleDto.staff[0].phone,
					role: sampleDto.staff[0].role,
					status: sampleDto.staff[0].status,
					avatar_url: sampleDto.staff[0].avatarUrl,
					created_at: sampleDto.staff[0].createdAt,
				},
			],
			documents: [
				{
					id: sampleDto.documents[0].id,
					document_type: sampleDto.documents[0].documentType,
					document_name: sampleDto.documents[0].documentName,
					document_key: sampleDto.documents[0].documentKey,
					verification_status: sampleDto.documents[0].verificationStatus,
					uploaded_at: sampleDto.documents[0].uploadedAt,
				},
			],
			images: [
				{
					id: sampleDto.images[0].id,
					object_key: sampleDto.images[0].objectKey,
					display_order: sampleDto.images[0].displayOrder,
					created_at: sampleDto.images[0].createdAt,
				},
			],
			linked_account: {
				email: sampleDto.linkedAccount.email,
				phone: sampleDto.linkedAccount.phone,
				is_email_verified: sampleDto.linkedAccount.isEmailVerified,
				last_login_at: sampleDto.linkedAccount.lastLoginAt,
			},
		});
	});

	it("should handle null address, settings, and profile gracefully", () => {
		const minimalDto: RestaurantDetailsResponseDto = {
			...sampleDto,
			address: null,
			settings: null,
			profile: null,
			operatingHours: [],
			staff: [],
			documents: [],
			images: [],
		};

		const result = AdminRestaurantResponseMapper.toResponse(minimalDto);

		expect(result.address).toBeNull();
		expect(result.settings).toBeNull();
		expect(result.profile).toBeNull();
		expect(result.operating_hours).toEqual([]);
		expect(result.staff).toEqual([]);
		expect(result.documents).toEqual([]);
		expect(result.images).toEqual([]);
	});
});
