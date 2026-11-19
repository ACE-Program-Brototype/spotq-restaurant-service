import { env } from "@/config/env.ts";
import pino, { type DestinationStream, type LoggerOptions } from "pino";
import { getRequestContext } from "./async-storage.ts";

export { loggerLocalStorage, type RequestContext } from "./async-storage.ts";

export interface LogHttpInfo {
	method: string;
	path: string;
	status_code?: number;
	duration_ms?: number;
	client_ip?: string;
}

export interface LogErrorInfo {
	name: string;
	code?: string;
	message: string;
	stack?: string;
}

export interface LogJobInfo {
	queue: string;
	routing_key?: string;
	job_id?: string;
	duration_ms?: number;
	status: string;
}

export interface LogEventInfo {
	action: string;
	[key: string]: unknown;
}

const CONTEXT_FIELD_MAP: Record<string, string> = {
	userId: "user_id",
	user_id: "user_id",
	customerId: "customer_id",
	customer_id: "customer_id",
	staffId: "staff_id",
	staff_id: "staff_id",
	restaurantId: "restaurant_id",
	restaurant_id: "restaurant_id",
	tableId: "table_id",
	table_id: "table_id",
	sectionId: "section_id",
	section_id: "section_id",
	categoryId: "category_id",
	category_id: "category_id",
	menuItemId: "menu_item_id",
	menu_item_id: "menu_item_id",
	variantId: "variant_id",
	variant_id: "variant_id",
	addonId: "addon_id",
	addon_id: "addon_id",
	orderId: "order_id",
	order_id: "order_id",
	subscriptionId: "subscription_id",
	subscription_id: "subscription_id",
	planCode: "plan_code",
	plan_code: "plan_code",
	cartId: "cart_id",
	cart_id: "cart_id",
	paymentId: "payment_id",
	payment_id: "payment_id",
	email: "email",
	phone: "phone",
	phoneNumber: "phone",
	phone_number: "phone",
	jobId: "job_id",
	job_id: "job_id",
	jobName: "job_name",
	job_name: "job_name",
	eventId: "event_id",
	event_id: "event_id",
	eventType: "event_type",
	event_type: "event_type",
};

function formatErrorObject(err: unknown): LogErrorInfo | undefined {
	if (!err) return undefined;
	if (err instanceof Error) {
		const code =
			(err as { code?: string; errorCode?: string }).code ||
			(err as { code?: string; errorCode?: string }).errorCode;
		return {
			name: err.name || "Error",
			...(code ? { code: String(code) } : {}),
			message: err.message,
			...(err.stack ? { stack: err.stack } : {}),
		};
	}
	if (typeof err === "object") {
		const errObj = err as Record<string, unknown>;
		const code = errObj.code || errObj.errCode || errObj.errorCode;
		return {
			name: String(errObj.name || errObj.errName || "Error"),
			...(code ? { code: String(code) } : {}),
			message: String(errObj.message || "Unknown error"),
			...(errObj.stack ? { stack: String(errObj.stack) } : {}),
		};
	}
	return {
		name: "Error",
		message: String(err),
	};
}

export const loggerOptions: LoggerOptions = {
	level: env.LOG_LEVEL || "info",
	base: null,
	timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
	messageKey: "message",
	formatters: {
		level: (label) => ({ level: label.toUpperCase() }),
		log: (rawObj: Record<string, unknown>) => {
			const {
				err,
				error,
				event,
				http,
				job,
				context: explicitContext,
				trace: explicitTrace,
				...rest
			} = rawObj;

			// Handle legacy msg field if message is not present
			if (rest.msg && !rest.message) {
				rest.message = rest.msg;
				delete rest.msg;
			}

			const store = getRequestContext();

			// 1. Build Trace block
			const trace: Record<string, unknown> = {
				...(store?.correlationId
					? { correlation_id: store.correlationId }
					: {}),
				...(store?.traceId ? { trace_id: store.traceId } : {}),
				...(store?.spanId ? { span_id: store.spanId } : {}),
				...(explicitTrace && typeof explicitTrace === "object"
					? explicitTrace
					: {}),
			};

			// Map legacy flat correlation/request fields if present
			if ("correlationId" in rest && rest.correlationId) {
				trace.correlation_id = rest.correlationId;
				delete rest.correlationId;
			}
			if ("requestId" in rest && rest.requestId) {
				if (!trace.correlation_id) {
					trace.correlation_id = rest.requestId;
				}
				delete rest.requestId;
			}

			// 2. Build Context block (mapping dynamic IDs into context)
			const context: Record<string, unknown> = {
				...(store?.restaurantId ? { restaurant_id: store.restaurantId } : {}),
				...(store?.userId ? { user_id: store.userId } : {}),
				...(store?.staffId ? { staff_id: store.staffId } : {}),
				...(explicitContext && typeof explicitContext === "object"
					? explicitContext
					: {}),
			};

			for (const [key, target] of Object.entries(CONTEXT_FIELD_MAP)) {
				if (key in rest && rest[key] !== undefined) {
					context[target] = rest[key];
					delete rest[key];
				}
			}

			// 3. Build Error block
			const errorInfo = formatErrorObject(error || err);

			// 4. Build Event block
			let eventInfo: LogEventInfo | undefined;
			if (event) {
				eventInfo =
					typeof event === "string"
						? { action: event }
						: (event as LogEventInfo);
			}

			// 5. Build Service block
			const serviceInfo = {
				name: env.SERVICE_NAME || "restaurant-service",
				version: env.SERVICE_VERSION || "1.0.0",
				environment: env.APP_ENV || env.NODE_ENV || "development",
			};

			return {
				service: serviceInfo,
				...(Object.keys(trace).length > 0 ? { trace } : {}),
				...(http && typeof http === "object" ? { http } : {}),
				...(errorInfo ? { error: errorInfo } : {}),
				...(eventInfo ? { event: eventInfo } : {}),
				...(job && typeof job === "object" ? { job } : {}),
				...(Object.keys(context).length > 0 ? { context } : {}),
				...rest,
			};
		},
	},
	redact: {
		paths: [
			"authorization",
			"cookie",
			"password",
			"passwordHash",
			"token",
			"accessToken",
			"refreshToken",
			"tempToken",
			"otp",
			"razorpay_signature",
			"razorpaySignature",
			"keySecret",
			"webhookSecret",
			"cardNumber",
			"card_number",
			"cvv",
			"headers.authorization",
			"headers.cookie",
			"req.headers.authorization",
			"req.headers.cookie",
			"context.password",
			"context.passwordHash",
			"context.token",
			"context.otp",
			"context.razorpay_signature",
			"context.card_number",
			"context.cvv",
			"*.password",
			"*.passwordHash",
			"*.token",
			"*.accessToken",
			"*.refreshToken",
			"*.tempToken",
			"*.otp",
			"*.razorpay_signature",
			"*.cardNumber",
			"*.card_number",
			"*.cvv",
		],
		censor: "[REDACTED]",
	},
	serializers: {
		err: pino.stdSerializers.err,
	},
};

export function createLogger(
	destination?: DestinationStream,
	options?: Partial<LoggerOptions>,
) {
	const mergedOptions: LoggerOptions = {
		...loggerOptions,
		...(options || {}),
	};
	return destination ? pino(mergedOptions, destination) : pino(mergedOptions);
}

export const logger = createLogger();
