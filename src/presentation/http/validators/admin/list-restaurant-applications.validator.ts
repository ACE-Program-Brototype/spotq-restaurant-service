import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const listRestaurantApplicationsSchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
		status: z.enum(["PENDING", "REJECTED"]).optional(),
		search: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		fromDate: z
			.string()
			.trim()
			.optional()
			.transform((val) => (val === "" ? undefined : val))
			.refine((val) => !val || !Number.isNaN(Date.parse(val)), {
				message: messages.INVALID_FROM_DATE_FORMAT,
			})
			.transform((val) => (val ? new Date(val) : undefined)),
		toDate: z
			.string()
			.trim()
			.optional()
			.transform((val) => (val === "" ? undefined : val))
			.refine((val) => !val || !Number.isNaN(Date.parse(val)), {
				message: messages.INVALID_TO_DATE_FORMAT,
			})
			.transform((val) => {
				if (!val) return undefined;
				const date = new Date(val);
				if (val.length === 10) {
					date.setUTCHours(23, 59, 59, 999);
				}
				return date;
			}),
		from_date: z.string().trim().optional(),
		to_date: z.string().trim().optional(),
		sortBy: z
			.enum([
				"createdAt",
				"updatedAt",
				"restaurantName",
				"status",
				"created_at",
				"updated_at",
				"restaurant_name",
			])
			.default("createdAt")
			.transform((val) => {
				if (val === "created_at") return "createdAt";
				if (val === "updated_at") return "updatedAt";
				if (val === "restaurant_name") return "restaurantName";
				return val;
			}),
		sort_by: z.string().trim().optional(),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		sort_order: z.enum(["asc", "desc"]).optional(),
	})
	.transform((data) => {
		let fromDate = data.fromDate;
		if (!fromDate && data.from_date && !Number.isNaN(Date.parse(data.from_date))) {
			fromDate = new Date(data.from_date);
		}

		let toDate = data.toDate;
		if (!toDate && data.to_date && !Number.isNaN(Date.parse(data.to_date))) {
			toDate = new Date(data.to_date);
			if (data.to_date.trim().length === 10) {
				toDate.setUTCHours(23, 59, 59, 999);
			}
		}

		let sortBy = data.sortBy;
		if (data.sort_by) {
			const s = data.sort_by;
			if (s === "created_at" || s === "createdAt") sortBy = "createdAt";
			else if (s === "updated_at" || s === "updatedAt") sortBy = "updatedAt";
			else if (s === "restaurant_name" || s === "restaurantName") sortBy = "restaurantName";
			else if (s === "status") sortBy = "status";
		}

		const sortOrder = data.sort_order ?? data.sortOrder;

		return {
			page: data.page,
			limit: data.limit,
			status: data.status,
			search: data.search,
			fromDate,
			toDate,
			sortBy: sortBy as "createdAt" | "updatedAt" | "restaurantName" | "status",
			sortOrder,
		};
	})
	.refine(
		(data) => {
			if (data.fromDate && data.toDate) {
				return data.fromDate <= data.toDate;
			}
			return true;
		},
		{
			message: "fromDate must be less than or equal to toDate",
			path: ["fromDate"],
		},
	);

export type ListRestaurantApplicationsQuery = z.infer<
	typeof listRestaurantApplicationsSchema
>;
