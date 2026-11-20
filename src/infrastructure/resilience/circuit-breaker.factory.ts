import {
	CircuitBreaker,
	type CircuitBreakerOptions,
	type FallbackFunction,
} from "@spotq-org/circuit-breaker";
import { env } from "@/config/env.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

export interface ServiceCircuitBreakerOptions<
	TArgs extends unknown[] = [() => Promise<unknown>],
	TReturn = unknown,
> {
	name: string;
	timeoutMs?: number;
	resetTimeoutMs?: number;
	errorThresholdPercentage?: number;
	volumeThreshold?: number;
	rollingWindowMs?: number;
	checkIsFailure?: (error: unknown, ...args: TArgs) => boolean;
	fallback?: FallbackFunction<TArgs, TReturn>;
	onOpen?: () => void;
	onClose?: () => void;
	onHalfOpen?: () => void;
}

/**
 * Standard HTTP status code failure filter for downstream microservices.
 * 4xx client errors (e.g. 400 Bad Request, 404 Not Found) are not service outages,
 * except 408 Request Timeout and 429 Too Many Requests (rate limiting/overload).
 */
export function defaultCheckIsFailure(error: unknown): boolean {
	const status = (error as { response?: { status?: number } })?.response?.status;
	if (typeof status === "number") {
		if (
			status >= HTTP_STATUS.BAD_REQUEST &&
			status < HTTP_STATUS.INTERNAL_SERVER_ERROR &&
			status !== HTTP_STATUS.REQUEST_TIMEOUT &&
			status !== HTTP_STATUS.TOO_MANY_REQUESTS
		) {
			return false;
		}
	}
	return true;
}

/**
 * Factory pattern creating standardized CircuitBreaker instances for S2S dependencies,
 * preconfigured with environment-based thresholds and status code resilience logic.
 */
export function createServiceCircuitBreaker<
	TArgs extends unknown[] = [() => Promise<unknown>],
	TReturn = unknown,
>(
	options: ServiceCircuitBreakerOptions<TArgs, TReturn>,
): CircuitBreaker<TArgs, TReturn> {
	const cbOptions: CircuitBreakerOptions<TArgs, TReturn> = {
		name: options.name,
		timeoutMs: options.timeoutMs ?? env.CIRCUIT_BREAKER_TIMEOUT_MS,
		resetTimeoutMs:
			options.resetTimeoutMs ?? env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
		errorThresholdPercentage:
			options.errorThresholdPercentage ??
			env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
		volumeThreshold:
			options.volumeThreshold ?? env.CIRCUIT_BREAKER_VOLUME_THRESHOLD,
		rollingWindowMs:
			options.rollingWindowMs ?? env.CIRCUIT_BREAKER_ROLLING_WINDOW_MS,
		checkIsFailure: options.checkIsFailure ?? defaultCheckIsFailure,
		fallback: options.fallback,
		onOpen: options.onOpen,
		onClose: options.onClose,
		onHalfOpen: options.onHalfOpen,
	};

	const action = (async (requestFn: () => Promise<unknown>) =>
		await requestFn()) as unknown as (...args: TArgs) => Promise<TReturn>;

	return new CircuitBreaker<TArgs, TReturn>(action, cbOptions);
}
