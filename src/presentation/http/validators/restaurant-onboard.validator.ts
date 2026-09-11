import { z } from "zod";

const documentItemSchema = z.object({
	documentName: z.string().trim().min(1, "Document name is required"),
	documentKey: z.string().trim().min(1, "Document key is required"),
});

const onboardDocumentsSchema = z.object({
	fssai: documentItemSchema,
	businessRegistration: documentItemSchema,
	ownerIdentity: documentItemSchema,
	gst: documentItemSchema,
	businessPan: documentItemSchema,
});

const onboardImageSchema = z.object({
	objectKey: z.string().trim().min(1, "Object key is required"),
	fileName: z.string().trim().optional(),
	displayOrder: z.coerce.number().int().optional(),
});

const onboardLocationSchema = z.preprocess(
	(val) => {
		if (val && typeof val === "object") {
			const obj = val as Record<string, unknown>;
			return {
				addressLine1: obj.addressLine1 ?? obj.address_line1,
				addressLine2: obj.addressLine2 ?? obj.address_line2,
				city: obj.city,
				state: obj.state,
				country: obj.country,
				pincode: obj.pincode,
				latitude: obj.latitude,
				longitude: obj.longitude,
			};
		}
		return val;
	},
	z.object({
		addressLine1: z.string().trim().min(1, "Address Line 1 is required"),
		addressLine2: z.string().trim().optional().nullable(),
		city: z.string().trim().min(1, "City is required"),
		state: z.string().trim().min(1, "State is required"),
		country: z.string().trim().min(1, "Country is required"),
		pincode: z.string().trim().min(1, "Pincode is required"),
		latitude: z.coerce
			.number()
			.min(-90)
			.max(90, "Latitude must be between -90 and 90"),
		longitude: z.coerce
			.number()
			.min(-180)
			.max(180, "Longitude must be between -180 and 180"),
	}),
);

export const onboardRestaurantSchema = z.preprocess(
	(val) => {
		if (val && typeof val === "object") {
			const obj = val as Record<string, unknown>;
			return {
				...obj,
				seatingCapacity: obj.seatingCapacity ?? obj.seating_capacity,
				restaurantImages: obj.restaurantImages ?? obj.restaurant_images,
			};
		}
		return val;
	},
	z.object({
		restaurantName: z.string().trim().min(1, "Restaurant name is required"),
		phone: z.string().trim().min(1, "Phone number is required"),
		ownerName: z.string().trim().min(1, "Owner name is required"),
		seatingCapacity: z.coerce.number().int().positive().optional(),
		documents: onboardDocumentsSchema.optional(),
		restaurantImages: z.array(onboardImageSchema).optional(),
		location: onboardLocationSchema.optional(),
	}),
);
