import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const listStaffMenuItemsParamsSchema = z
	.object({
		restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

import {
	parseBooleanFilter,
	parseOptionalString,
} from "./utils/query-parser.util.ts";

function parseAvailabilityFilter(val: unknown): unknown {
	if (val === undefined || val === null) return undefined;
	if (typeof val === "boolean") return val;
	if (typeof val === "string") {
		const trimmed = val.trim().toLowerCase();
		if (trimmed === "" || trimmed === "all") return undefined;
		if (trimmed === "true" || trimmed === "1" || trimmed === "available") {
			return true;
		}
		if (
			trimmed === "false" ||
			trimmed === "0" ||
			trimmed === "out_of_stock" ||
			trimmed === "86"
		) {
			return false;
		}
	}
	return val;
}

export const ALLOWED_STAFF_SORT_FIELDS = [
	"createdAt",
	"name",
	"price",
	"basePrice",
	"displayOrder",
	"categoryDisplayOrder",
	"updatedAt",
	"isAvailable",
	"created_at",
	"base_price",
	"display_order",
	"category_display_order",
	"updated_at",
	"is_available",
	"first_created",
	"last_created",
] as const;

export const listStaffMenuItemsQuerySchema = z
	.object({
		page: z.preprocess(
			parseOptionalString,
			z.coerce.number().int().min(1).default(1),
		),
		limit: z.preprocess(
			parseOptionalString,
			z.coerce.number().int().min(1).max(100).default(50),
		),
		search: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		categoryId: z.preprocess(
			parseOptionalString,
			z.string().uuid({ message: messages.INVALID_CATEGORY_ID }).optional(),
		),
		category_id: z.preprocess(
			parseOptionalString,
			z.string().uuid({ message: messages.INVALID_CATEGORY_ID }).optional(),
		),
		isAvailable: z.preprocess(parseAvailabilityFilter, z.boolean().optional()),
		is_available: z.preprocess(parseAvailabilityFilter, z.boolean().optional()),
		status: z.preprocess(parseAvailabilityFilter, z.boolean().optional()),
		includeInactive: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		include_inactive: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		includeVariants: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		include_variants: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		sortBy: z.preprocess(
			parseOptionalString,
			z.enum(ALLOWED_STAFF_SORT_FIELDS).optional(),
		),
		sort_by: z.preprocess(
			parseOptionalString,
			z.enum(ALLOWED_STAFF_SORT_FIELDS).optional(),
		),
		sortOrder: z
			.preprocess((val) => {
				if (typeof val === "string") {
					const trimmed = val.trim().toLowerCase();
					return trimmed === "" ? undefined : trimmed;
				}
				return val;
			}, z.enum(["asc", "desc"]).optional())
			.optional(),
		sort_order: z
			.preprocess((val) => {
				if (typeof val === "string") {
					const trimmed = val.trim().toLowerCase();
					return trimmed === "" ? undefined : trimmed;
				}
				return val;
			}, z.enum(["asc", "desc"]).optional())
			.optional(),
	})
	.transform((data) => {
		const rawSortBy = data.sortBy ?? data.sort_by;
		let mappedSortBy = rawSortBy;
		let rawSortOrder = data.sortOrder ?? data.sort_order;

		if (rawSortBy === "first_created") {
			mappedSortBy = "createdAt";
			rawSortOrder = "asc";
		} else if (rawSortBy === "last_created") {
			mappedSortBy = "createdAt";
			rawSortOrder = "desc";
		} else if (rawSortBy === "created_at") {
			mappedSortBy = "createdAt";
		} else if (rawSortBy === "base_price" || rawSortBy === "basePrice") {
			mappedSortBy = "price";
		} else if (rawSortBy === "updated_at") {
			mappedSortBy = "updatedAt";
		} else if (rawSortBy === "is_available") {
			mappedSortBy = "isAvailable";
		} else if (
			rawSortBy === "display_order" ||
			rawSortBy === "category_display_order"
		) {
			mappedSortBy = "displayOrder";
		}

		const resolvedIsAvailable =
			data.isAvailable !== undefined
				? data.isAvailable
				: data.is_available !== undefined
					? data.is_available
					: data.status;

		const resolvedIncludeInactive =
			data.includeInactive !== undefined
				? data.includeInactive
				: data.include_inactive !== undefined
					? data.include_inactive
					: false;

		const resolvedIncludeVariants =
			data.includeVariants !== undefined
				? data.includeVariants
				: data.include_variants !== undefined
					? data.include_variants
					: true;

		return {
			page: data.page,
			limit: data.limit,
			search: data.search,
			categoryId: data.categoryId ?? data.category_id,
			isAvailable: resolvedIsAvailable,
			includeInactive: resolvedIncludeInactive,
			includeVariants: resolvedIncludeVariants,
			sortBy: mappedSortBy,
			sortOrder: (rawSortOrder as "asc" | "desc") || "asc",
		};
	});

export type ListStaffMenuItemsParams = z.infer<
	typeof listStaffMenuItemsParamsSchema
>;
export type ListStaffMenuItemsQuery = z.infer<
	typeof listStaffMenuItemsQuerySchema
>;
