import type { BrevoClient } from "@getbrevo/brevo";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Job } from "bullmq";
import type { IEmailService } from "@/application/ports/services/email-service.port";
import type { ILogger } from "@/application/ports/services/logger.interface";
import { EmailWorker } from "@/infrastructure/queue/workers/email.worker";
import { JOB_NAMES } from "@/shared/constants/queue.constants";

describe("EmailWorker", () => {
	let worker: EmailWorker;
	let mockEmailService: jest.Mocked<IEmailService>;
	let mockBrevoClient: BrevoClient;
	let mockLogger: ILogger;

	beforeEach(() => {
		mockEmailService = {
			sendVerificationEmail: jest.fn<() => Promise<void>>().mockResolvedValue(),
		};

		mockBrevoClient = {
			transactionalEmails: {
				sendTransacEmail: jest.fn().mockResolvedValue({} as never),
			},
		} as unknown as BrevoClient;

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		} as unknown as ILogger;

		worker = new EmailWorker(mockEmailService, mockBrevoClient, mockLogger);
	});

	describe("processJob", () => {
		it("should process verification OTP jobs properly", async () => {
			const mockJob = {
				id: "job-1",
				name: JOB_NAMES.EMAIL.VERIFICATION_OTP,
				data: {
					toEmail: "test@example.com",
					otp: "123456",
				},
			} as Job;

			await worker.processJob(mockJob);

			expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
				"test@example.com",
				"123456",
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.objectContaining({
					jobId: "job-1",
					jobName: JOB_NAMES.EMAIL.VERIFICATION_OTP,
					event: "EMAIL_JOB_PROCESSING",
				}),
				"Processing email job",
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.objectContaining({
					jobId: "job-1",
					jobName: JOB_NAMES.EMAIL.VERIFICATION_OTP,
					event: "EMAIL_JOB_COMPLETED",
				}),
				"Email job completed successfully",
			);
		});

		it("should process transactional email jobs properly", async () => {
			const mockJob = {
				id: "job-2",
				name: JOB_NAMES.EMAIL.TRANSACTIONAL,
				data: {
					to: "staff@example.com",
					subject: "Staff Invitation",
					htmlContent: "<p>Welcome</p>",
					recipientName: "Staff User",
				},
			} as Job;

			await worker.processJob(mockJob);

			expect(
				mockBrevoClient.transactionalEmails.sendTransacEmail,
			).toHaveBeenCalledWith(
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
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.objectContaining({
					jobId: "job-2",
					jobName: JOB_NAMES.EMAIL.TRANSACTIONAL,
					event: "EMAIL_JOB_COMPLETED",
				}),
				"Email job completed successfully",
			);
		});

		it("should log a warning when an unknown job name is received", async () => {
			const mockJob = {
				id: "job-99",
				name: "UNKNOWN_EMAIL_JOB",
				data: {},
			} as unknown as Job;

			await worker.processJob(mockJob);

			expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
			expect(
				mockBrevoClient.transactionalEmails.sendTransacEmail,
			).not.toHaveBeenCalled();
			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					jobId: "job-99",
					jobName: "UNKNOWN_EMAIL_JOB",
				}),
				"Unknown email job type received",
			);
		});
	});

	describe("stop", () => {
		it("should gracefully handle stop when worker is not started", async () => {
			await expect(worker.stop()).resolves.toBeUndefined();
		});

		it("should close the worker instance and log event when worker is active", async () => {
			const mockClose = jest.fn<() => Promise<void>>().mockResolvedValue();
			// biome-ignore lint/suspicious/noExplicitAny: inject active worker for lifecycle test
			(worker as any).worker = { close: mockClose };

			await worker.stop();

			expect(mockClose).toHaveBeenCalledTimes(1);
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.objectContaining({ event: "EMAIL_WORKER_STOPPED" }),
				"Email worker stopped successfully",
			);
			// biome-ignore lint/suspicious/noExplicitAny: verify worker instance cleared
			expect((worker as any).worker).toBeUndefined();
		});
	});
});
