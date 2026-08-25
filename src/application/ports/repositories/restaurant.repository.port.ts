export interface IRestaurantRepository {
	existsByEmail(email: string): Promise<boolean>;
}
