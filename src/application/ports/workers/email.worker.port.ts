export interface IEmailWorker {
	start(): void;
	stop(): Promise<void>;
}
