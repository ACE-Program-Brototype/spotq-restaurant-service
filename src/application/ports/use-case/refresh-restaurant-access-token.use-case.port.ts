export interface RefreshRestaurantAccessTokenDto {
	refreshToken: string;
}

export interface IRefreshRestaurantAccessTokenUseCase {
	execute(dto: RefreshRestaurantAccessTokenDto): Promise<{ accessToken: string }>;
}
