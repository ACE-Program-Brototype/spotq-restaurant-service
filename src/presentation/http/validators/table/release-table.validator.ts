import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const releaseTableParamsSchema = z
	.object({
		restaurantId: z.string().uuid(messages.INVALID_RESTAURANT_ID),
	})
	.strict();

export const releaseTableItemSchema = z
	.object({
		tableId: z.string().uuid(messages.INVALID_TABLE_ID),
		occupancyToRelease: z
			.number()
			.int()
			.positive(messages.INVALID_TABLE_CAPACITY),
	})
	.strict();

export const releaseTableBodySchema = z
	.object({
		tables: z.array(releaseTableItemSchema).min(1, messages.TABLES_REQUIRED),
	})
	.strict()
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

export type ReleaseTableParams = z.infer<typeof releaseTableParamsSchema>;
export type ReleaseTableBody = z.infer<typeof releaseTableBodySchema>;
