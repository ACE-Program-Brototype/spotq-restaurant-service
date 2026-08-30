import { loginStaffSchema } from "@/presentation/http/validators/staff/login-staff.validator.ts";

describe("loginStaffSchema Validator", () => {
	it("should parse valid login credentials successfully", async () => {
		const result = await loginStaffSchema.parseAsync({
			email: "  admin@spotq.com  ",
			password: "Password@123",
		});

		expect(result.email).toBe("admin@spotq.com");
		expect(result.password).toBe("Password@123");
	});

	it("should fail validation on invalid email or short password", async () => {
		await expect(
			loginStaffSchema.parseAsync({
				email: "invalid-email",
				password: "123",
			}),
		).rejects.toThrow();
	});

	it("should fail validation when fields are missing", async () => {
		await expect(loginStaffSchema.parseAsync({})).rejects.toThrow();
	});
});
