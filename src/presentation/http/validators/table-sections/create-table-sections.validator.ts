import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const createTableSectionParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

export const createTableSectionBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, { message: messages.TABLE_SECTION_NAME_REQUIRED }),
	})
	.strict();

export type CreateTableSectionParams = z.infer<
	typeof createTableSectionParamsSchema
>;
export type CreateTableSectionBody = z.infer<
	typeof createTableSectionBodySchema
>;
