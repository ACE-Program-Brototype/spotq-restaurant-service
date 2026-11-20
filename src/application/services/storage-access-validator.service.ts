import { injectable } from "inversify";
import { UnauthorizedEntityAccessError } from "@/application/errors/unauthorized-entity-access.error";
import type { IStorageAccessValidator } from "@/application/ports/services/storage-access-validator.service.port";
import { AUTH_ROLES } from "@/shared/constants/auth.constants";
import {
	RESTAURANT_STORAGE_ENTITY_TYPES,
	STAFF_AVATAR_KEY_REGEX,
	USER_STAFF_STORAGE_ENTITY_TYPES,
} from "@/shared/constants/storage.constants";
import type { AuthContext } from "@/shared/types/auth.types";

@injectable()
export class StorageAccessValidatorService implements IStorageAccessValidator {
	validateOwnership(normalizedKey: string, context?: AuthContext): void {
		const role = context?.role?.toLowerCase();
		if (role === AUTH_ROLES.ADMIN) {
			return;
		}

		if (!context || (!context.userId && !context.restaurantId)) {
			throw new UnauthorizedEntityAccessError();
		}

		const segments = normalizedKey.split("/");
		if (segments.length < 2) {
			throw new UnauthorizedEntityAccessError();
		}

		const [rawEntityType, entityId] = segments;
		const entityType = rawEntityType.toLowerCase();

		if (RESTAURANT_STORAGE_ENTITY_TYPES.has(entityType)) {
			const callerRestaurantId = context.restaurantId || context.userId;

			if (!callerRestaurantId || callerRestaurantId !== entityId) {
				throw new UnauthorizedEntityAccessError();
			}

			if (role === AUTH_ROLES.STAFF) {
				const staffAvatarMatch = normalizedKey.match(STAFF_AVATAR_KEY_REGEX);
				if (!staffAvatarMatch) {
					throw new UnauthorizedEntityAccessError();
				}
				const targetStaffId = staffAvatarMatch[1];
				if (!context.userId || targetStaffId !== context.userId) {
					throw new UnauthorizedEntityAccessError();
				}
				return;
			}
			return;
		}

		if (USER_STAFF_STORAGE_ENTITY_TYPES.has(entityType)) {
			if (!context.userId || context.userId !== entityId) {
				throw new UnauthorizedEntityAccessError();
			}
			return;
		}

		if (context.userId !== entityId && context.restaurantId !== entityId) {
			throw new UnauthorizedEntityAccessError();
		}
	}
}
