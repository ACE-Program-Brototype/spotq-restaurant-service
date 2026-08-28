import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IEmailQueuePort } from "@/application/ports/services/email-queue.port.ts";
import type { IOtpService } from "@/application/ports/services/otp-service.port.ts";
import { ForgotPasswordUseCase } from "@/application/use-cases/staff/forgot-password.use-case.ts";
import { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import {
	StaffInactiveError,
	StaffNotFoundError,
	StaffSuspendedError,
} from "@/domain/errors/staff.errors.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";

describe("ForgotPasswordUseCase", () => {
	let staffRepository: jest.Mocked<IRestaurantStaffRepository>;
	let otpRepository: jest.Mocked<IOtpRepository>;
	let otpService: jest.Mocked<IOtpService>;
	let emailQueuePort: jest.Mocked<IEmailQueuePort>;
	let useCase: ForgotPasswordUseCase;

	const activeStaff = RestaurantStaff.reconstitute({
		id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		fullname: "Sarah Manager",
		email: "manager@spotq.com",
		phone: "+1234567890",
		avatarUrl: null,
		passwordHash: "hashedPassword",
		role: "MANAGER",
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
			update: jest.fn(),
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

		useCase = new ForgotPasswordUseCase(
			staffRepository,
			otpRepository,
			otpService,
			emailQueuePort,
		);
	});

	it("should generate 6-digit OTP via otpService, save in Redis, and queue email job for active staff", async () => {
		staffRepository.findByEmail.mockResolvedValue(activeStaff);
		otpService.generateOtp.mockReturnValue("123456");
		otpRepository.saveOtp.mockResolvedValue();
		emailQueuePort.sendVerificationOtp.mockResolvedValue();

		await useCase.execute({ email: "manager@spotq.com" });

		expect(staffRepository.findByEmail).toHaveBeenCalledWith(
			"manager@spotq.com",
		);
		expect(otpService.generateOtp).toHaveBeenCalledWith(6);
		expect(otpRepository.saveOtp).toHaveBeenCalledWith(
			"manager@spotq.com",
			"123456",
			300,
		);
		expect(emailQueuePort.sendVerificationOtp).toHaveBeenCalledWith({
			to: "manager@spotq.com",
			otp: "123456",
			recipientName: "Sarah Manager",
			validityMinutes: 5,
		});
	});

	it("should throw StaffNotFoundError when email does not exist", async () => {
		staffRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "nonexistent@spotq.com" }),
		).rejects.toThrow(StaffNotFoundError);
	});

	it("should throw StaffSuspendedError when staff account is suspended", async () => {
		const suspendedStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+1234567890",
			avatarUrl: null,
			passwordHash: "hashedPassword",
			role: "MANAGER",
			status: "SUSPENDED",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		staffRepository.findByEmail.mockResolvedValue(suspendedStaff);

		await expect(
			useCase.execute({ email: "manager@spotq.com" }),
		).rejects.toThrow(StaffSuspendedError);
	});

	it("should throw StaffInactiveError when staff account is inactive", async () => {
		const inactiveStaff = RestaurantStaff.reconstitute({
			id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Sarah Manager",
			email: "manager@spotq.com",
			phone: "+1234567890",
			avatarUrl: null,
			passwordHash: "hashedPassword",
			role: "MANAGER",
			status: "INACTIVE",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		staffRepository.findByEmail.mockResolvedValue(inactiveStaff);

		await expect(
			useCase.execute({ email: "manager@spotq.com" }),
		).rejects.toThrow(StaffInactiveError);
	});
});
