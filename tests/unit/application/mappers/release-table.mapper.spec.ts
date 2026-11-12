import { describe, expect, it } from "@jest/globals";
import { ReleaseTableMapper } from "@/application/mappers/table/release-table.mapper.ts";
import { TABLE_STATUS } from "@/domain/constants/table.constants.ts";
import type { Table } from "@/domain/entities/table.entity.ts";

describe("ReleaseTableMapper", () => {
	it("maps array of Table domain entities to ReleaseTableResponseDTO", () => {
		const mockTable1 = {
			id: "table-1",
			tableCode: "T-01",
			status: TABLE_STATUS.AVAILABLE,
			currentOccupancy: 0,
			capacity: 4,
		} as unknown as Table;

		const mockTable2 = {
			id: "table-2",
			tableCode: "T-02",
			status: TABLE_STATUS.PARTIAL_OCCUPIED,
			currentOccupancy: 2,
			capacity: 6,
		} as unknown as Table;

		const result = ReleaseTableMapper.toResponseDTO([mockTable1, mockTable2]);

		expect(result).toEqual({
			releasedTables: [
				{
					tableId: "table-1",
					tableCode: "T-01",
					status: TABLE_STATUS.AVAILABLE,
					currentOccupancy: 0,
					capacity: 4,
				},
				{
					tableId: "table-2",
					tableCode: "T-02",
					status: TABLE_STATUS.PARTIAL_OCCUPIED,
					currentOccupancy: 2,
					capacity: 6,
				},
			],
		});
	});
});

