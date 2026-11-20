import { pool, prisma } from "@/config/prisma.ts";

describe("Prisma and pg.Pool configuration", () => {
	it("should initialize pg.Pool with pool limits and idle timeout from env", () => {
		expect(pool).toBeDefined();
		expect(pool.options.max).toBe(4);
		expect(pool.options.connectionTimeoutMillis).toBe(5000);
		expect(pool.options.idleTimeoutMillis).toBe(30000);
	});

	it("should initialize PrismaClient with pg adapter", () => {
		expect(prisma).toBeDefined();
	});
});
