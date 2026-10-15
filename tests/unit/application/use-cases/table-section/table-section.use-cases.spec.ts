import { GetTableSectionUseCase } from "@/application/use-cases/table-section/get-table-section.use-case.ts";
import { TABLE_SECTION_MODE } from "@/domain/constants/table-section.constants.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { TableSection } from "@/domain/entities/table-section.entity.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import { ForbiddenAccessError } from "@/domain/errors/staff.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import type { ITableSectionRepository } from "@/domain/repositories/table-section.respository.interface.ts";

describe("Table section use cases", () => {
	const restaurantId = "restaurant-1";
	let restaurantRepo: jest.Mocked<IRestaurantRepository>;
	let sectionRepo: jest.Mocked<ITableSectionRepository>;
	let getUseCase: GetTableSectionUseCase;

	beforeEach(() => {
		restaurantRepo = {
			findById: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;
		sectionRepo = {
			findAllByRestaurantId: jest.fn(),
			findManyWithFilter: jest.fn(),
		} as unknown as jest.Mocked<ITableSectionRepository>;
		getUseCase = new GetTableSectionUseCase(sectionRepo, restaurantRepo);
	});

	const restaurant = (overrides: Record<string, unknown> = {}) =>
		({
			id: restaurantId,
			isBlocked: false,
			ensureAdminAccess: jest.fn(),
			...overrides,
		}) as unknown as Restaurant;

	it("returns all sections in all mode", async () => {
		restaurantRepo.findById.mockResolvedValue(restaurant());
		const section = TableSection.create({ restaurantId, name: "Patio" });
		sectionRepo.findAllByRestaurantId.mockResolvedValue([section]);

		await expect(
			getUseCase.execute({
				userId: restaurantId,
				restaurantId,
				mode: TABLE_SECTION_MODE.ALL,
			}),
		).resolves.toEqual({
			mode: TABLE_SECTION_MODE.ALL,
			sections: [{ id: section.id, name: "Patio" }],
		});
	});

	it("returns paginated sections and forwards pagination", async () => {
		restaurantRepo.findById.mockResolvedValue(restaurant());
		const section = TableSection.create({ restaurantId, name: "Patio" });
		sectionRepo.findManyWithFilter.mockResolvedValue({
			tableSections: [section],
			total: 1,
		});

		await expect(
			getUseCase.execute({
				userId: restaurantId,
				restaurantId,
				mode: TABLE_SECTION_MODE.PAGINATED,
				page: 2,
				limit: 5,
			}),
		).resolves.toEqual({
			mode: TABLE_SECTION_MODE.PAGINATED,
			sections: [{ id: section.id, name: "Patio" }],
			total: 1,
		});
		expect(sectionRepo.findManyWithFilter).toHaveBeenCalledWith({
			restaurantId,
			page: 2,
			limit: 5,
			sortBy: "createdAt",
			sortOrder: "desc",
		});
	});

	it("rejects a user who does not administer the restaurant", async () => {
		const restaurantEntity = restaurant();
		jest.mocked(restaurantEntity.ensureAdminAccess).mockImplementation(() => {
			throw new ForbiddenAccessError();
		});
		restaurantRepo.findById.mockResolvedValue(restaurantEntity);

		await expect(
			getUseCase.execute({
				restaurantId,
				userId: "another-user",
				mode: TABLE_SECTION_MODE.ALL,
			}),
		).rejects.toThrow(ForbiddenAccessError);
		expect(restaurantEntity.ensureAdminAccess).toHaveBeenCalledWith(
			"another-user",
		);
		expect(sectionRepo.findAllByRestaurantId).not.toHaveBeenCalled();
	});

	it("rejects a blocked restaurant before fetching sections", async () => {
		const restaurantEntity = restaurant({ isBlocked: true });
		jest.mocked(restaurantEntity.ensureAdminAccess).mockImplementation(() => {
			throw new RestaurantAccountBlockedError();
		});
		restaurantRepo.findById.mockResolvedValue(restaurantEntity);

		await expect(
			getUseCase.execute({
				userId: restaurantId,
				restaurantId,
				mode: TABLE_SECTION_MODE.PAGINATED,
				page: 1,
				limit: 10,
			}),
		).rejects.toThrow(RestaurantAccountBlockedError);
		expect(sectionRepo.findManyWithFilter).not.toHaveBeenCalled();
	});

	it("returns an empty section list when pagination has no results", async () => {
		restaurantRepo.findById.mockResolvedValue(restaurant());
		sectionRepo.findManyWithFilter.mockResolvedValue({
			tableSections: [],
			total: 0,
		});

		await expect(
			getUseCase.execute({
				userId: restaurantId,
				restaurantId,
				mode: TABLE_SECTION_MODE.PAGINATED,
				page: 1,
				limit: 10,
			}),
		).resolves.toEqual({
			mode: TABLE_SECTION_MODE.PAGINATED,
			sections: [],
			total: 0,
		});
	});

	it("rejects a missing restaurant when listing", async () => {
		restaurantRepo.findById.mockResolvedValue(null);
		await expect(
			getUseCase.execute({
				userId: restaurantId,
				restaurantId,
				mode: TABLE_SECTION_MODE.ALL,
			}),
		).rejects.toThrow(RestaurantNotFoundError);
	});
});
