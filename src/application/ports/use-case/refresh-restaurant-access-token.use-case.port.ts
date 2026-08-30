export interface IRefreshRestaurantAccessTokenUseCase {
	execute(refreshToken: string): Promise<{ accessToken: string }>;
}
