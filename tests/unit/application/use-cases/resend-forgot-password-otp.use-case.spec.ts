import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";
import { ResendForgotPasswordOtpUseCase } from "@/application/use-cases/staff/resend-forgot-password-otp.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import { StaffNotFoundError } from "@/domain/errors/staff.errors.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("ResendForgotPasswordOtpUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let otpRepository: jest.Mocked<IOtpRepository>;
	let otpService: jest.Mocked<IOtpService>;
	let emailQueuePort: jest.Mocked<IEmailQueuePort>;
	let useCase: ResendForgotPasswordOtpUseCase;

	const activeStaff = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Sarah Manager",
		email: "manager@spotq.com",
		phone: "+1234567890",
		avatarUrl: null,
		passwordHash: "hashedPassword",
		role: "STAFF",
		status: "ACTIVE",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	beforeEach(() => {
		staffRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByRestaurantId: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
		};

		otpRepository = {
			saveOtp: jest.fn(),
			getOtp: jest.fn(),
			verifyOtp: jest.fn(),
			deleteOtp: jest.fn(),
		};

		otpService = {
			generateOtp: jest.fn(),
		};

		emailQueuePort = {
			sendVerificationOtp: jest.fn(),
		};

		useCase = new ResendForgotPasswordOtpUseCase(
			staffRepository,
			otpRepository,
			otpService,
			emailQueuePort,
		);
	});

	it("should refresh OTP in Redis via otpService and queue resent email", async () => {
		staffRepository.findByEmail.mockResolvedValue(activeStaff);
		otpService.generateOtp.mockReturnValue("654321");
		otpRepository.saveOtp.mockResolvedValue();
		emailQueuePort.sendVerificationOtp.mockResolvedValue();

		await useCase.execute({ email: "manager@spotq.com" });

		expect(otpService.generateOtp).toHaveBeenCalledWith(6);
		expect(otpRepository.saveOtp).toHaveBeenCalledWith(
			"manager@spotq.com",
			"654321",
			300,
		);
		expect(emailQueuePort.sendVerificationOtp).toHaveBeenCalledWith({
			to: "manager@spotq.com",
			otp: "654321",
			recipientName: "Sarah Manager",
			validityMinutes: 5,
		});
	});

	it("should throw StaffNotFoundError if email is not found", async () => {
		staffRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "unknown@spotq.com" }),
		).rejects.toThrow(StaffNotFoundError);
	});
});
