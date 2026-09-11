import { z } from "zod";
import { RESTAURANT_STATUSES } from "@/domain/value-objects/restaurant-status.vo.ts";
import { SUBSCRIPTION_PLANS } from "@/domain/value-objects/subscription-plan.vo.ts";

export const SORT_FIELDS = [
	"created_at",
	"createdAt",
	"restaurant_name",
	"restaurantName",
	"owner_name",
	"ownerName",
	"status",
	"plan",
	"subscriptionPlanCode",
	"updated_at",
	"updatedAt",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];

export const PRISMA_SORT_MAP: Record<
	SortField,
	| "createdAt"
	| "restaurantName"
	| "ownerName"
	| "status"
	| "subscriptionPlanCode"
	| "updatedAt"
> = {
	created_at: "createdAt",
	createdAt: "createdAt",
	restaurant_name: "restaurantName",
	restaurantName: "restaurantName",
	owner_name: "ownerName",
	ownerName: "ownerName",
	status: "status",
	plan: "subscriptionPlanCode",
	subscriptionPlanCode: "subscriptionPlanCode",
	updated_at: "updatedAt",
	updatedAt: "updatedAt",
};

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
		plan: z.enum(SUBSCRIPTION_PLANS).optional(),
		is_subscription_active: z.preprocess((val) => {
			if (val === undefined || val === null || val === "") return undefined;
			if (typeof val === "string") {
				const lower = val.trim().toLowerCase();
				if (lower === "true") return true;
				if (lower === "false") return false;
			}
			if (typeof val === "boolean") return val;
			return val;
		}, z.boolean().optional()),
		isSubscriptionActive: z.preprocess((val) => {
			if (val === undefined || val === null || val === "") return undefined;
			if (typeof val === "string") {
				const lower = val.trim().toLowerCase();
				if (lower === "true") return true;
				if (lower === "false") return false;
			}
			if (typeof val === "boolean") return val;
			return val;
		}, z.boolean().optional()),
		created_from: z.coerce.date().optional(),
		createdFrom: z.coerce.date().optional(),
		created_to: z.coerce.date().optional(),
		createdTo: z.coerce.date().optional(),
		sort_by: z.enum(SORT_FIELDS).optional(),
		sortBy: z.enum(SORT_FIELDS).optional(),
		sort_order: z.enum(["asc", "desc"]).optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	})
	.refine(
		(data) => {
			const from = data.created_from ?? data.createdFrom;
			const to = data.created_to ?? data.createdTo;
			if (from && to) {
				return from.getTime() <= to.getTime();
			}
			return true;
		},
		{
			message: "created_from must not be later than created_to",
			path: ["created_from"],
		},
	)
	.transform((data) => {
		const rawSortBy = data.sort_by ?? data.sortBy;
		const mappedSortBy = rawSortBy
			? PRISMA_SORT_MAP[rawSortBy]
			: ("createdAt" as const);

		return {
			page: data.page,
			limit: data.limit,
			search: data.search,
			status: data.status,
			plan: data.plan,
			isSubscriptionActive:
				data.is_subscription_active ?? data.isSubscriptionActive,
			createdFrom: data.created_from ?? data.createdFrom,
			createdTo: data.created_to ?? data.createdTo,
			sortBy: mappedSortBy,
			sortOrder: data.sort_order ?? data.sortOrder ?? "desc",
		};
	});

export type ListRestaurantsQuery = z.infer<typeof listRestaurantsQuerySchema>;

