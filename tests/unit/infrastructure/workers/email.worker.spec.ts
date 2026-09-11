import type { BrevoClient } from "@getbrevo/brevo";
import { describe, expect, it, jest } from "@jest/globals";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import { EmailWorker } from "@/infrastructure/queue/workers/email.worker";
import { JOB_NAMES } from "@/shared/constants/queue.constants";

jest.mock("bullmq", () => {
	return {
		Worker: jest.fn().mockImplementation((_queue: unknown, processor: unknown) => {
			return {
				processor,
				on: jest.fn(),
				close: jest.fn().mockResolvedValue(undefined as never),
			};
		}),
	};
});

describe("EmailWorker", () => {
	const mockEmailService: jest.Mocked<IEmailService> = {
		sendVerificationEmail: jest.fn<() => Promise<void>>().mockResolvedValue(),
	};

	const mockBrevoClient = {
		transactionalEmails: {
			sendTransacEmail: jest.fn().mockResolvedValue({} as never),
		},
	} as unknown as BrevoClient;

	const mockLogger = {
		info: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	} as unknown as ILogger;

	it("should process verification OTP jobs properly", async () => {
		const worker = new EmailWorker(mockEmailService, mockBrevoClient, mockLogger);
		worker.start();

		// biome-ignore lint/suspicious/noExplicitAny: access mock worker
		const processor = (worker as any).worker.processor;

		await processor({
			id: "job-1",
			name: JOB_NAMES.EMAIL.VERIFICATION_OTP,
			data: {
				toEmail: "test@example.com",
				otp: "123456",
			},
		});

		expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
			"test@example.com",
			"123456",
		);
	});

	it("should process transactional email jobs properly", async () => {
		const worker = new EmailWorker(mockEmailService, mockBrevoClient, mockLogger);
		worker.start();

		// biome-ignore lint/suspicious/noExplicitAny: access mock worker
		const processor = (worker as any).worker.processor;

		await processor({
			id: "job-2",
			name: JOB_NAMES.EMAIL.TRANSACTIONAL,
			data: {
				to: "staff@example.com",
				subject: "Staff Invitation",
				htmlContent: "<p>Welcome</p>",
				recipientName: "Staff User",
			},
		});

		expect(mockBrevoClient.transactionalEmails.sendTransacEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				subject: "Staff Invitation",
				htmlContent: "<p>Welcome</p>",
				to: [
					{
						email: "staff@example.com",
						name: "Staff User",
					},
				],
			}),
		);
	});

	it("should stop worker gracefully", async () => {
		const worker = new EmailWorker(mockEmailService, mockBrevoClient, mockLogger);
		worker.start();
		await worker.stop();
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.objectContaining({ event: "EMAIL_WORKER_STOPPED" }),
			expect.any(String),
		);
	});
});
