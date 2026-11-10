import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
	CircuitBreaker,
	CircuitBreakerOpenError,
	CircuitBreakerTimeoutError,
} from "@/infrastructure/resilience/circuit-breaker.ts";

describe("CircuitBreaker", () => {
	let breaker: CircuitBreaker;

	beforeEach(() => {
		jest.useRealTimers();
		breaker = new CircuitBreaker("test-service", {
			failureThreshold: 3,
			cooldownPeriodMs: 500,
			requestTimeoutMs: 100,
		});
	});

	it("should start in CLOSED state", () => {
		expect(breaker.getState()).toBe("CLOSED");
	});

	it("should execute action successfully and remain CLOSED", async () => {
		const result = await breaker.execute(async () => "success");
		expect(result).toBe("success");
		expect(breaker.getState()).toBe("CLOSED");
	});

	it("should trip to OPEN after failure threshold is reached", async () => {
		const failingAction = async () => {
			throw new Error("network error");
		};

		// 1st failure
		await expect(breaker.execute(failingAction)).rejects.toThrow(
			"network error",
		);
		expect(breaker.getState()).toBe("CLOSED");

		// 2nd failure
		await expect(breaker.execute(failingAction)).rejects.toThrow(
			"network error",
		);
		expect(breaker.getState()).toBe("CLOSED");

		// 3rd failure (trips)
		await expect(breaker.execute(failingAction)).rejects.toThrow(
			"network error",
		);
		expect(breaker.getState()).toBe("OPEN");

		// 4th call should immediately fail fast with CircuitBreakerOpenError without calling action
		const mockAction = jest.fn<() => Promise<string>>();
		await expect(breaker.execute(mockAction)).rejects.toThrow(
			CircuitBreakerOpenError,
		);
		expect(mockAction).not.toHaveBeenCalled();
	});

	it("should transition to HALF_OPEN after cooldown period and recover to CLOSED on success", async () => {
		const failingAction = async () => {
			throw new Error("fail");
		};

		for (let i = 0; i < 3; i++) {
			await expect(breaker.execute(failingAction)).rejects.toThrow();
		}
		expect(breaker.getState()).toBe("OPEN");

		// Wait for cooldown (500ms)
		await new Promise((r) => setTimeout(r, 550));
		expect(breaker.getState()).toBe("HALF_OPEN");

		// Canary request succeeds
		const result = await breaker.execute(async () => "recovered");
		expect(result).toBe("recovered");
		expect(breaker.getState()).toBe("CLOSED");
	});

	it("should re-trip to OPEN if canary request in HALF_OPEN fails", async () => {
		const failingAction = async () => {
			throw new Error("fail");
		};

		for (let i = 0; i < 3; i++) {
			await expect(breaker.execute(failingAction)).rejects.toThrow();
		}
		expect(breaker.getState()).toBe("OPEN");

		// Wait for cooldown
		await new Promise((r) => setTimeout(r, 550));
		expect(breaker.getState()).toBe("HALF_OPEN");

		// Canary request fails
		await expect(breaker.execute(failingAction)).rejects.toThrow();
		expect(breaker.getState()).toBe("OPEN");
	});

	it("should abort action and throw CircuitBreakerTimeoutError when execution exceeds timeout", async () => {
		const slowAction = async (signal: AbortSignal) => {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => resolve("too late"), 250);
				signal.addEventListener("abort", () => {
					clearTimeout(timer);
					reject(new Error("aborted"));
				});
			});
		};

		await expect(breaker.execute(slowAction)).rejects.toThrow(
			CircuitBreakerTimeoutError,
		);
	});

	it("should not count HTTP 4xx client errors as service outage failures", async () => {
		const clientErrorAction = async () => {
			const err = new Error("Not Found") as Error & {
				response: { status: number };
			};
			err.response = { status: 404 };
			throw err;
		};

		// Even after 5 consecutive 404 errors, breaker should remain CLOSED
		for (let i = 0; i < 5; i++) {
			await expect(breaker.execute(clientErrorAction)).rejects.toThrow(
				"Not Found",
			);
		}

		expect(breaker.getState()).toBe("CLOSED");
	});

	it("should not count HTTP 4xx client errors as service outage failures", async () => {
		const clientErrorAction = async () => {
			const err = new Error("Not Found") as Error & { response: { status: number } };
			err.response = { status: 404 };
			throw err;
		};

		// Even after 5 consecutive 404 errors, breaker should remain CLOSED
		for (let i = 0; i < 5; i++) {
			await expect(breaker.execute(clientErrorAction)).rejects.toThrow("Not Found");
		}

		expect(breaker.getState()).toBe("CLOSED");
	});
});
