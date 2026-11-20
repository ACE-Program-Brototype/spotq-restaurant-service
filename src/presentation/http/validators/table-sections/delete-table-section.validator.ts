import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const deleteTableSectionParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		tableSectionId: z.uuid({ message: messages.INVALID_TABLE_SECTION_ID }),
	})
	.strict();

export type DeleteTableSectionParams = z.infer<
	typeof deleteTableSectionParamsSchema
>;
