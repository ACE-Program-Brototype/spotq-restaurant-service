import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
	type IEntityMapper,
	PrismaBaseRepository,
} from "@/infrastructure/database/repositories/prisma-base.repository.ts";

interface TestEntity {
	id: string;
	name: string;
	value: number;
}

interface TestPrismaModel {
	id: string;
	name: string;
	value: number;
	created_at: Date;
}

class TestCustomError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TestCustomError";
	}
}

const testMapper: IEntityMapper<TestEntity, TestPrismaModel> = {
	toDomain(raw: TestPrismaModel): TestEntity {
		return {
			id: raw.id,
			name: raw.name,
			value: raw.value,
		};
	},
	toPersistence(entity: TestEntity): TestPrismaModel {
		return {
			id: entity.id,
			name: entity.name,
			value: entity.value,
			created_at: new Date(),
		};
	},
};

type MockDelegateType = {
	findUnique: jest.Mock;
	findMany: jest.Mock;
	upsert: jest.Mock;
	delete: jest.Mock;
	count: jest.Mock;
};

class TestRepository extends PrismaBaseRepository<
	TestEntity,
	TestPrismaModel,
	MockDelegateType
> {
	constructor(dbModel: MockDelegateType) {
		super(dbModel, testMapper);
	}

	protected override handlePrismaError(
		error: unknown,
		context?: unknown,
	): void {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new TestCustomError("Entity already exists");
			}
			if (error.code === "P2025") {
				throw new TestCustomError(`Entity not found: ${String(context)}`);
			}
		}
	}
}

describe("PrismaBaseRepository", () => {
	let mockDelegate: {
		findUnique: jest.Mock;
		findMany: jest.Mock;
		upsert: jest.Mock;
		delete: jest.Mock;
		count: jest.Mock;
	};
	let repository: TestRepository;

	const dummyModel: TestPrismaModel = {
		id: "test-id-123",
		name: "Test Name",
		value: 42,
		created_at: new Date(),
	};

	const dummyEntity: TestEntity = {
		id: "test-id-123",
		name: "Test Name",
		value: 42,
	};

	beforeEach(() => {
		mockDelegate = {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			upsert: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		};
		repository = new TestRepository(mockDelegate);
	});

	describe("findById", () => {
		it("should return domain entity when record exists", async () => {
			mockDelegate.findUnique.mockResolvedValue(dummyModel);

			const result = await repository.findById("test-id-123");

			expect(mockDelegate.findUnique).toHaveBeenCalledWith({
				where: { id: "test-id-123" },
			});
			expect(result).toEqual(dummyEntity);
		});

		it("should return null when record does not exist", async () => {
			mockDelegate.findUnique.mockResolvedValue(null);

			const result = await repository.findById("non-existent-id");

			expect(result).toBeNull();
		});
	});

	describe("exists", () => {
		it("should return true when count > 0", async () => {
			mockDelegate.count.mockResolvedValue(1);

			const result = await repository.exists("test-id-123");

			expect(result).toBe(true);
			expect(mockDelegate.count).toHaveBeenCalledWith({
				where: { id: "test-id-123" },
			});
		});

		it("should return false when count is 0", async () => {
			mockDelegate.count.mockResolvedValue(0);

			const result = await repository.exists("test-id-123");

			expect(result).toBe(false);
		});
	});

	describe("save", () => {
		it("should upsert entity successfully", async () => {
			mockDelegate.upsert.mockResolvedValue(dummyModel);

			await repository.save(dummyEntity);

			expect(mockDelegate.upsert).toHaveBeenCalledWith({
				where: { id: "test-id-123" },
				update: expect.objectContaining({
					name: "Test Name",
					value: 42,
				}),
				create: expect.objectContaining({
					id: "test-id-123",
					name: "Test Name",
					value: 42,
				}),
			});
		});

		it("should handle known Prisma error on save", async () => {
			const prismaError = new PrismaClientKnownRequestError("Duplicate", {
				code: "P2002",
				clientVersion: "5.0.0",
			});
			mockDelegate.upsert.mockRejectedValue(prismaError);

			await expect(repository.save(dummyEntity)).rejects.toThrow(
				TestCustomError,
			);
		});
	});

	describe("delete", () => {
		it("should delete entity successfully", async () => {
			mockDelegate.delete.mockResolvedValue(dummyModel);

			await repository.delete("test-id-123");

			expect(mockDelegate.delete).toHaveBeenCalledWith({
				where: { id: "test-id-123" },
			});
		});

		it("should handle known Prisma error on delete", async () => {
			const prismaError = new PrismaClientKnownRequestError("Not found", {
				code: "P2025",
				clientVersion: "5.0.0",
			});
			mockDelegate.delete.mockRejectedValue(prismaError);

			await expect(repository.delete("test-id-123")).rejects.toThrow(
				TestCustomError,
			);
		});
	});
});
