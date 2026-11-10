export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
	failureThreshold?: number;
	cooldownPeriodMs?: number;
	requestTimeoutMs?: number;
}

export class CircuitBreakerOpenError extends Error {
	constructor(public readonly serviceName: string) {
		super(`CircuitBreaker[${serviceName}] is OPEN. Fast-failing request.`);
		this.name = "CircuitBreakerOpenError";
	}
}

export class CircuitBreakerTimeoutError extends Error {
	constructor(
		public readonly serviceName: string,
		public readonly timeoutMs: number,
	) {
		super(
			`CircuitBreaker[${serviceName}] request timed out after ${timeoutMs}ms.`,
		);
		this.name = "CircuitBreakerTimeoutError";
	}
}

export class CircuitBreaker {
	private state: CircuitBreakerState = "CLOSED";
	private failureCount = 0;
	private nextAttemptTimestamp = 0;
	private readonly failureThreshold: number;
	private readonly cooldownPeriodMs: number;
	private readonly requestTimeoutMs: number;

	constructor(
		public readonly serviceName: string,
		config?: CircuitBreakerConfig,
	) {
		this.failureThreshold = config?.failureThreshold ?? 5;
		this.cooldownPeriodMs = config?.cooldownPeriodMs ?? 30_000;
		this.requestTimeoutMs = config?.requestTimeoutMs ?? 3_000;
	}

	public async execute<T>(
		action: (signal: AbortSignal) => Promise<T>,
	): Promise<T> {
		const now = Date.now();

		if (this.state === "OPEN") {
			if (now >= this.nextAttemptTimestamp) {
				this.state = "HALF_OPEN";
			} else {
				throw new CircuitBreakerOpenError(this.serviceName);
			}
		}

		const controller = new AbortController();
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, this.requestTimeoutMs);

		try {
			const result = await action(controller.signal);
			this.onSuccess();
			return result;
		} catch (error) {
			if (this.isServiceOutageError(error)) {
				this.onFailure();
			}
			if (timedOut) {
				throw new CircuitBreakerTimeoutError(
					this.serviceName,
					this.requestTimeoutMs,
				);
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}
	}

	private isServiceOutageError(error: unknown): boolean {
		const status = (error as { response?: { status?: number } })?.response
			?.status;
		if (typeof status === "number") {
			// HTTP 4xx (client errors) like 400, 401, 403, 404, 422 are not downstream service outages.
			// 408 (Request Timeout) and 429 (Too Many Requests) can indicate upstream load/degradation.
			if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
				return false;
			}
		}
		return true;
	}

	private onSuccess(): void {
		this.failureCount = 0;
		this.state = "CLOSED";
	}

	private onFailure(): void {
		this.failureCount++;
		if (
			this.state === "HALF_OPEN" ||
			this.failureCount >= this.failureThreshold
		) {
			this.state = "OPEN";
			this.nextAttemptTimestamp = Date.now() + this.cooldownPeriodMs;
		}
	}

	public getState(): CircuitBreakerState {
		if (this.state === "OPEN" && Date.now() >= this.nextAttemptTimestamp) {
			return "HALF_OPEN";
		}
		return this.state;
	}

	public reset(): void {
		this.state = "CLOSED";
		this.failureCount = 0;
		this.nextAttemptTimestamp = 0;
	}
}
