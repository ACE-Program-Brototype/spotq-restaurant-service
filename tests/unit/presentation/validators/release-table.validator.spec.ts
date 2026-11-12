import { describe, expect, it } from "@jest/globals";
import {
	releaseTableBodySchema,
	releaseTableParamsSchema,
} from "@/presentation/http/validators/table/release-table.validator.ts";

describe("releaseTableValidator", () => {
	const validRestaurantId = "2b6f0cc9-8d13-4f2e-a123-9e8ab12cd345";
	const validTableId1 = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
	const validTableId2 = "3fa85f64-5717-4562-b3fc-2c963f66afa7";

	describe("releaseTableParamsSchema", () => {
		it("accepts valid UUID restaurantId", () => {
			const result = releaseTableParamsSchema.safeParse({
				restaurantId: validRestaurantId,
			});
			expect(result.success).toBe(true);
		});

		it("rejects non-UUID restaurantId", () => {
			const result = releaseTableParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("releaseTableBodySchema", () => {
		it("accepts valid table release array", () => {
			const result = releaseTableBodySchema.safeParse({
				tables: [
					{ tableId: validTableId1, occupancyToRelease: 2 },
					{ tableId: validTableId2, occupancyToRelease: 1 },
				],
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty tables array", () => {
			const result = releaseTableBodySchema.safeParse({
				tables: [],
			});
			expect(result.success).toBe(false);
		});

		it("rejects non-positive occupancyToRelease", () => {
			const resultZero = releaseTableBodySchema.safeParse({
				tables: [{ tableId: validTableId1, occupancyToRelease: 0 }],
			});
			expect(resultZero.success).toBe(false);

			const resultNeg = releaseTableBodySchema.safeParse({
				tables: [{ tableId: validTableId1, occupancyToRelease: -1 }],
			});
			expect(resultNeg.success).toBe(false);
		});

		it("rejects duplicate table IDs in the same batch", () => {
			const result = releaseTableBodySchema.safeParse({
				tables: [
					{ tableId: validTableId1, occupancyToRelease: 1 },
					{ tableId: validTableId1, occupancyToRelease: 2 },
				],
			});
			expect(result.success).toBe(false);
		});
	});
});
