import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
	requestId: string;
	correlationId?: string;
	traceId?: string;
	spanId?: string;
	userId?: string;
	restaurantId?: string;
	staffId?: string;
}

export type LoggerStore = RequestContext;

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
export const loggerLocalStorage = requestContextStorage;

export function getRequestContext(): RequestContext | undefined {
	return requestContextStorage.getStore();
}
