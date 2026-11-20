import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const releaseTableParamsSchema = z.object({
	restaurantId: z.string().uuid(messages.INVALID_RESTAURANT_ID),
});

export const releaseTableBodySchema = z
	.object({
		tables: z
			.array(
				z.object({
					tableId: z.string().uuid(messages.INVALID_TABLE_ID),
					occupancyToRelease: z
						.number()
						.int()
						.positive(messages.INVALID_TABLE_CAPACITY),
				}),
			)
			.min(1, messages.TABLES_REQUIRED),
	})
	.superRefine(({ tables }, ctx) => {
		const seen = new Set<string>();

		tables.forEach((table, index) => {
			if (seen.has(table.tableId)) {
				ctx.addIssue({
					code: "custom",
					path: ["tables", index, "tableId"],
					message: messages.DUPLICATE_TABLE_ID,
				});
			}

			seen.add(table.tableId);
		});
	});
