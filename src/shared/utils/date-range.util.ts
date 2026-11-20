import {
	type AnalyticsPeriod,
	REPORTING_TIMEZONE,
} from "@/shared/constants/analytics.constants.ts";

export interface ResolvedDateRange {
	startDate: Date;
	endDate: Date;
	fromIso: string;
	toIso: string;
	year: number;
	month: number;
	day: number | null;
	period: AnalyticsPeriod;
	timezone: string;
}

export interface ResolveDateRangeInput {
	period?: AnalyticsPeriod;
	day?: number | null;
	month?: number;
	year?: number;
	from?: string | null;
	to?: string | null;
	fiscalYear?: number | null;
	timezone?: string;
}

/**
 * Returns current date parts (year, month 1-12, day 1-31) in the target timezone.
 * Avoids server local timezone divergence (e.g. UTC servers vs IST business calendar).
 */
export function getCurrentZonedParts(timeZone: string = REPORTING_TIMEZONE): {
	year: number;
	month: number;
	day: number;
} {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(now);
	const currentParts: Record<string, number> = {};
	for (const p of parts) {
		if (p.type !== "literal") {
			currentParts[p.type] = Number.parseInt(p.value, 10);
		}
	}
	return {
		year: currentParts.year,
		month: currentParts.month,
		day: currentParts.day,
	};
}

/**
 * Checks whether a given year, month (1-12), and day (1-31) form a valid calendar date.
 * E.g., Feb 31 -> false, Feb 29 on leap year -> true, Feb 29 on non-leap year -> false.
 */
export function isValidCalendarDate(
	year: number,
	month: number,
	day: number,
): boolean {
	if (month < 1 || month > 12 || day < 1 || day > 31) {
		return false;
	}
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

/**
 * Computes exact UTC Date object corresponding to given calendar parts in the specified timezone.
 */
export function getZonedDate(
	year: number,
	month: number, // 1-12
	day: number,
	hour = 0,
	minute = 0,
	second = 0,
	timeZone: string = REPORTING_TIMEZONE,
): Date {
	const utcGuess = new Date(
		Date.UTC(year, month - 1, day, hour, minute, second),
	);

	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	const parts = formatter.formatToParts(utcGuess);
	const partMap: Record<string, number> = {};
	for (const part of parts) {
		if (part.type !== "literal") {
			partMap[part.type] = Number.parseInt(part.value, 10);
		}
	}

	const zonedAsUtc = Date.UTC(
		partMap.year,
		partMap.month - 1,
		partMap.day,
		partMap.hour === 24 ? 0 : partMap.hour,
		partMap.minute,
		partMap.second,
	);

	const offsetMs = zonedAsUtc - utcGuess.getTime();
	return new Date(utcGuess.getTime() - offsetMs);
}

/**
 * Resolves consistent date boundaries across all services and database queries.
 * Defines explicit precedence:
 * 1. If explicit 'from' & 'to' are provided without 'period', legacy range takes precedence.
 * 2. Otherwise, structured parameters ('period', 'year' / 'fiscalYear', 'month', 'day') define the range.
 */
export function resolveAnalyticsDateRange(
	input: ResolveDateRangeInput,
): ResolvedDateRange {
	const timezone = input.timezone || REPORTING_TIMEZONE;
	const currentZoned = getCurrentZonedParts(timezone);

	// Case 1: Legacy from & to provided without new structured period
	if (input.from && input.to && !input.period) {
		const startDate = new Date(input.from);
		const endDate = new Date(input.to);

		const startParts = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(startDate);

		const pMap: Record<string, number> = {};
		for (const p of startParts) {
			if (p.type !== "literal") {
				pMap[p.type] = Number.parseInt(p.value, 10);
			}
		}

		return {
			startDate,
			endDate,
			fromIso: input.from,
			toIso: input.to,
			year: pMap.year || currentZoned.year,
			month: pMap.month || currentZoned.month,
			day: pMap.day || null,
			period: "MONTH" as AnalyticsPeriod,
			timezone,
		};
	}

	// Case 2: Structured period resolution (with fiscalYear fallback)
	const period: AnalyticsPeriod = (input.period || "MONTH") as AnalyticsPeriod;
	const year = input.year ?? input.fiscalYear ?? currentZoned.year;
	const month = input.month ?? currentZoned.month;
	const day = input.day ?? (period === "DAY" ? currentZoned.day : null);

	let startDate: Date;
	let nextPeriodStart: Date;

	switch (period) {
		case "DAY": {
			const activeDay = day ?? currentZoned.day;
			startDate = getZonedDate(year, month, activeDay, 0, 0, 0, timezone);
			nextPeriodStart = getZonedDate(
				year,
				month,
				activeDay + 1,
				0,
				0,
				0,
				timezone,
			);
			break;
		}
		case "WEEK": {
			const activeDay = day ?? currentZoned.day;
			const targetDate = getZonedDate(
				year,
				month,
				activeDay,
				0,
				0,
				0,
				timezone,
			);
			const weekday = new Intl.DateTimeFormat("en-US", {
				timeZone: timezone,
				weekday: "short",
			}).format(targetDate);

			const dayMap: Record<string, number> = {
				Mon: 0,
				Tue: -1,
				Wed: -2,
				Thu: -3,
				Fri: -4,
				Sat: -5,
				Sun: -6,
			};
			const mondayOffset = dayMap[weekday] ?? 0;

			startDate = getZonedDate(
				year,
				month,
				activeDay + mondayOffset,
				0,
				0,
				0,
				timezone,
			);
			nextPeriodStart = getZonedDate(
				year,
				month,
				activeDay + mondayOffset + 7,
				0,
				0,
				0,
				timezone,
			);
			break;
		}
		case "MONTH": {
			startDate = getZonedDate(year, month, 1, 0, 0, 0, timezone);
			nextPeriodStart = getZonedDate(year, month + 1, 1, 0, 0, 0, timezone);
			break;
		}
		case "YEAR": {
			startDate = getZonedDate(year, 1, 1, 0, 0, 0, timezone);
			nextPeriodStart = getZonedDate(year + 1, 1, 1, 0, 0, 0, timezone);
			break;
		}
		default: {
			startDate = getZonedDate(year, month, 1, 0, 0, 0, timezone);
			nextPeriodStart = getZonedDate(year, month + 1, 1, 0, 0, 0, timezone);
			break;
		}
	}

	const endDate = new Date(nextPeriodStart.getTime() - 1);

	return {
		startDate,
		endDate,
		fromIso: startDate.toISOString(),
		toIso: endDate.toISOString(),
		year,
		month,
		day,
		period,
		timezone,
	};
}
