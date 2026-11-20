import { TableSection } from "@/domain/entities/table-section.entity.ts";

describe("TableSection Entity", () => {
	it("reconstitutes persisted fields unchanged", () => {
		const createdAt = new Date("2026-01-01T00:00:00Z");
		const updatedAt = new Date("2026-01-02T00:00:00Z");
		const section = TableSection.reconstitute({
			id: "section-1",
			restaurantId: "restaurant-1",
			sectionName: "Patio",
			createdAt,
			updatedAt,
			isDeleted: true,
		});

		expect(section.id).toBe("section-1");
		expect(section.restaurantId).toBe("restaurant-1");
		expect(section.sectionName).toBe("Patio");
		expect(section.createdAt).toBe(createdAt);
		expect(section.updatedAt).toBe(updatedAt);
		expect(section.isDeleted).toBe(true);
	});
});
