import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
	requestId: string;
	correlationId?: string;
	userId?: string;
	restaurantId?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
	return requestContextStorage.getStore();
}
