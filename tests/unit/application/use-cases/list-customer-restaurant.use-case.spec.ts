import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ListCustomerRestaurantsUseCase } from "@/application/use-cases/restaurant/list-customer-restaurant.use-case.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";

describe("ListCustomerRestaurantsUseCase", () => {
	let mockRestaurantRepository: jest.Mocked<IRestaurantRepository>;
	let useCase: ListCustomerRestaurantsUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		mockRestaurantRepository = {
			findCustomerRestaurants: jest.fn(),
		} as unknown as jest.Mocked<IRestaurantRepository>;

		useCase = new ListCustomerRestaurantsUseCase(mockRestaurantRepository);
	});

	it("returns exact restaurant data with live S3 coverImage or null, never generating fallback mock images", async () => {
		const mockRestaurants = [
			{
				id: "res-1",
				restaurantName: "Biryani Palace",
				city: "Kozhikode",
				state: "Kerala",
				cuisineType: "Mandi",
				averageCost: 500,
				coverImage: "restaurants/res-1/covers/hero.jpg",
				createdAt: new Date("2026-10-15T10:00:00.000Z"),
			},
			{
				id: "res-2",
				restaurantName: "Dhaba Express",
				city: "Kochi",
				state: "Kerala",
				cuisineType: "North Indian",
				averageCost: 350,
				coverImage: null,
				createdAt: new Date("2026-10-15T11:00:00.000Z"),
			},
		];

		mockRestaurantRepository.findCustomerRestaurants.mockResolvedValueOnce({
			restaurants: mockRestaurants,
			total: 2,
		});

		const result = await useCase.execute({ page: 1, limit: 10 });

		expect(result.pagination).toEqual({
			page: 1,
			limit: 10,
			total: 2,
			totalPages: 1,
		});

		expect(result.data).toHaveLength(2);
		expect(result.data[0].coverImage).toBe("restaurants/res-1/covers/hero.jpg");
		expect(result.data[1].coverImage).toBeNull();
		expect(result.data[0].restaurantName).toBe("Biryani Palace");
		expect(result.data[1].restaurantName).toBe("Dhaba Express");
	});

	it("passes search and filters directly to the repository", async () => {
		mockRestaurantRepository.findCustomerRestaurants.mockResolvedValueOnce({
			restaurants: [],
			total: 0,
		});

		await useCase.execute({
			search: "Mandi",
			city: "Kozhikode",
			cuisine: "Mandi",
			minPrice: 200,
			maxPrice: 800,
			sortBy: "averageCost",
			sortOrder: "asc",
		});

		expect(
			mockRestaurantRepository.findCustomerRestaurants,
		).toHaveBeenCalledWith({
			search: "Mandi",
			city: "Kozhikode",
			cuisine: "Mandi",
			minPrice: 200,
			maxPrice: 800,
			sortBy: "averageCost",
			sortOrder: "asc",
			page: 1,
			limit: 10,
		});
	});
});
