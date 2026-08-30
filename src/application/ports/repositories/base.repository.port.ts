export interface IBaseRepository<T> {
	create(data: Partial<T>): Promise<T>;

	findById(id: string): Promise<T | null>;

	findUnique(where: Record<string, unknown>): Promise<T | null>;

	find(): Promise<T[]>;
}
