import { z } from "zod";

const SORT_FIELDS = [
  "createdAt",
  "restaurantName",
  "name",
  "city",
  "price",
  "rating",
] as const;

export const listCustomerRestaurantsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().max(100).optional(),

    city: z.string().trim().max(100).optional(),

    cuisine: z.string().trim().max(100).optional(),

    foodItem: z.string().trim().max(100).optional(),

    minRating: z.coerce.number().min(0).max(5).optional(),

    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    sortBy: z.enum(SORT_FIELDS).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    },
  );

export type ListCustomerRestaurantsQuery = z.infer<
  typeof listCustomerRestaurantsQuerySchema
>;
