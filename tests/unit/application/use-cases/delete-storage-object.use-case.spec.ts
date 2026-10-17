import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UnauthorizedEntityAccessError } from "@/application/errors/unauthorized-entity-access.error";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { DeleteStorageObjectUseCase } from "@/application/use-cases/delete-storage-object.use-case";
import { InvalidStorageKeyError, StorageOperationFailedError } from "@/domain/errors/storage.errors";
import { StorageAccessValidatorService } from "@/domain/services/storage-access-validator.service";
import { messages } from "@/shared/constants/message.constants";

describe("DeleteStorageObjectUseCase", () => {
	let useCase: DeleteStorageObjectUseCase;
	let mockStorageService: jest.Mocked<IStorageService>;

	const restaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const otherRestaurantId = "b2ffcd00-0d1c-5fa9-cc7e-7cc0ce491b22";
	const userId = "c3aabcd1-1e2f-4aa1-bb2c-8dd1ee592c33";
	const otherUserId = "d4bbced2-2f3a-5bb2-cc3d-9ee2ff603d44";

	beforeEach(() => {
		mockStorageService = {
			generatePresignedUploadUrl: jest.fn(),
			generatePresignedGetUrl: jest.fn(),
			deleteObject: jest.fn<IStorageService["deleteObject"]>().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<IStorageService>;

		const validator = new StorageAccessValidatorService();
		useCase = new DeleteStorageObjectUseCase(mockStorageService, validator);
	});

	describe("Restaurant ownership validation", () => {
		it("deletes object when key belongs to the authenticated restaurant", async () => {
			const key = `restaurants/${restaurantId}/documents/fssai.pdf`;

			const result = await useCase.execute(
				{ key },
				{ restaurantId, role: "RESTAURANT" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(key);
			expect(result).toEqual({
				success: true,
				message: messages.S3_OBJECT_DELETED_SUCCESS,
			});
		});

		it("deletes object when key uses singular restaurant/ prefix", async () => {
			const key = `restaurant/${restaurantId}/menu/item.jpg`;

			const result = await useCase.execute(
				{ key },
				{ restaurantId, role: "RESTAURANT" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(key);
			expect(result.success).toBe(true);
		});

		it("prevents restaurant from deleting another restaurant's object", async () => {
			const foreignKey = `restaurants/${otherRestaurantId}/documents/fssai.pdf`;

			await expect(
				useCase.execute(
					{ key: foreignKey },
					{ restaurantId, role: "RESTAURANT" },
				),
			).rejects.toThrow(UnauthorizedEntityAccessError);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});
	});

	describe("User & Staff ownership validation", () => {
		it("allows user to delete their own profile object", async () => {
			const key = `users/${userId}/profile/avatar.png`;

			const result = await useCase.execute(
				{ key },
				{ userId, role: "CUSTOMER" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(key);
			expect(result.success).toBe(true);
		});

		it("prevents user from deleting another user's object", async () => {
			const foreignKey = `users/${otherUserId}/profile/avatar.png`;

			await expect(
				useCase.execute(
					{ key: foreignKey },
					{ userId, role: "CUSTOMER" },
				),
			).rejects.toThrow(UnauthorizedEntityAccessError);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});

		it("allows STAFF to delete their own avatar", async () => {
			const staffId = "staff-user-1";
			const avatarKey = `restaurants/${restaurantId}/staff/${staffId}/avatar.png`;

			const result = await useCase.execute(
				{ key: avatarKey },
				{ userId: staffId, restaurantId, role: "STAFF" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(avatarKey);
			expect(result.success).toBe(true);
		});

		it("prevents STAFF from deleting another staff member's avatar", async () => {
			const myStaffId = "staff-user-1";
			const otherStaffId = "staff-user-2";
			const avatarKey = `restaurants/${restaurantId}/staff/${otherStaffId}/avatar.png`;

			await expect(
				useCase.execute(
					{ key: avatarKey },
					{ userId: myStaffId, restaurantId, role: "STAFF" },
				),
			).rejects.toThrow(UnauthorizedEntityAccessError);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});
	});

	describe("Privileged roles bypass", () => {
		it("allows ADMIN to delete any object key", async () => {
			const foreignKey = `restaurants/${otherRestaurantId}/documents/fssai.pdf`;

			const result = await useCase.execute(
				{ key: foreignKey },
				{ userId: "admin-1", role: "ADMIN" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(foreignKey);
			expect(result.success).toBe(true);
		});
	});

	describe("Key safety & errors", () => {
		it("strips leading slash and checks ownership correctly", async () => {
			const key = `/restaurants/${restaurantId}/images/banner.png`;

			const result = await useCase.execute(
				{ key },
				{ restaurantId, role: "RESTAURANT" },
			);

			expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
				`restaurants/${restaurantId}/images/banner.png`,
			);
			expect(result.success).toBe(true);
		});

		it("rejects invalid key with path traversal ('..')", async () => {
			await expect(
				useCase.execute(
					{ key: `restaurants/${restaurantId}/../../etc/passwd` },
					{ restaurantId, role: "RESTAURANT" },
				),
			).rejects.toThrow(InvalidStorageKeyError);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});

		it("rejects empty key string", async () => {
			await expect(
				useCase.execute(
					{ key: "   " },
					{ restaurantId, role: "RESTAURANT" },
				),
			).rejects.toThrow(InvalidStorageKeyError);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});

		it("rejects deletion when authContext is missing", async () => {
			const key = `restaurants/${restaurantId}/documents/fssai.pdf`;

			await expect(useCase.execute({ key }, undefined)).rejects.toThrow(
				UnauthorizedEntityAccessError,
			);

			expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
		});

		it("propagates StorageOperationFailedError when storage service fails", async () => {
			const storageError = new StorageOperationFailedError("Failed to delete S3 object");
			mockStorageService.deleteObject.mockRejectedValueOnce(storageError);

			await expect(
				useCase.execute(
					{ key: `restaurants/${restaurantId}/documents/fssai.pdf` },
					{ restaurantId, role: "RESTAURANT" },
				),
			).rejects.toThrow(storageError);
		});
	});
});
