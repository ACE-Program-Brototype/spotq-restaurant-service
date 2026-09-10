import { z } from "zod";
import { ONBOARDING_STATUSES } from "@/domain/value-objects/onboarding-status.vo.ts";
import { RESTAURANT_STATUSES } from "@/domain/value-objects/restaurant-status.vo.ts";

export const listRestaurantsQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
		search: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		status: z.enum(RESTAURANT_STATUSES).optional(),
		plan: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		is_subscription_active: z.preprocess((val) => {
			if (typeof val === "string") {
				if (val.toLowerCase() === "true") return true;
				if (val.toLowerCase() === "false") return false;
			}
			if (typeof val === "boolean") return val;
			return undefined;
		}, z.boolean().optional()),
		isSubscriptionActive: z.preprocess((val) => {
			if (typeof val === "string") {
				if (val.toLowerCase() === "true") return true;
				if (val.toLowerCase() === "false") return false;
			}
			if (typeof val === "boolean") return val;
			return undefined;
		}, z.boolean().optional()),
		onboarding_status: z.enum(ONBOARDING_STATUSES).optional(),
		onboardingStatus: z.enum(ONBOARDING_STATUSES).optional(),
		created_from: z.coerce.date().optional(),
		createdFrom: z.coerce.date().optional(),
		created_to: z.coerce.date().optional(),
		createdTo: z.coerce.date().optional(),
		sort_by: z
			.enum([
				"createdAt",
				"restaurantName",
				"ownerName",
				"status",
				"subscriptionPlanCode",
				"updatedAt",
			])
			.optional(),
		sortBy: z
			.enum([
				"createdAt",
				"restaurantName",
				"ownerName",
				"status",
				"subscriptionPlanCode",
				"updatedAt",
			])
			.optional(),
		sort_order: z.enum(["asc", "desc"]).optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	})
	.transform((data) => {
		return {
			page: data.page,
			limit: data.limit,
			search: data.search,
			status: data.status,
			plan: data.plan,
			isSubscriptionActive:
				data.is_subscription_active ?? data.isSubscriptionActive,
			onboardingStatus: data.onboarding_status ?? data.onboardingStatus,
			createdFrom: data.created_from ?? data.createdFrom,
			createdTo: data.created_to ?? data.createdTo,
			sortBy: data.sort_by ?? data.sortBy ?? "createdAt",
			sortOrder: data.sort_order ?? data.sortOrder ?? "desc",
		};
	});

export type ListRestaurantsQuery = z.infer<typeof listRestaurantsQuerySchema>;
