export interface ListCustomerRestaurantsInputDto {
  page: number;
  limit: number;
  search?: string;
  city?: string;
  cuisine?: string;
  foodItem?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy: "createdAt" | "restaurantName" | "city" | "price" | "rating";
  sortOrder: "asc" | "desc";
}

export interface CustomerRestaurantItemDto {
  id: string;
  restaurantName: string;
  city: string | null;
  state: string | null;
  cuisineType: string | null;
  averageCost: number | null;
  createdAt: Date;
}

export interface PaginatedCustomerRestaurantsOutputDto {
  data: CustomerRestaurantItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

