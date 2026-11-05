import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const getBatchRestaurantsBodySchema = z
	.object({
		restaurantIds: z
			.array(
				z
					.string()
					.trim()
					.uuid({ message: messages.INVALID_RESTAURANT_ID_FORMAT }),
			)
			.min(1, { message: messages.RESTAURANT_IDS_REQUIRED })
			.max(100, { message: messages.RESTAURANT_IDS_MAX_LIMIT }),
	})
	.strict();

export type GetBatchRestaurantsBody = z.infer<
	typeof getBatchRestaurantsBodySchema
>;
