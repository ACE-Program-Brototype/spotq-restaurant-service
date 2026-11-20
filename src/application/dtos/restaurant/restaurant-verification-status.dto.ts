export type VerificationStatus =
	| "SUBMITTED"
	| "UNDER_REVIEW"
	| "VERIFIED"
	| "REJECTED";

export interface RestaurantVerificationStatusResponseDto {
	status: VerificationStatus;
	rejectionReason?: string;
	submittedAt: string;
	updatedAt: string;
}
