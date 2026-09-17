export interface IBaseRepository<T, ID = string> {
	findById(id: ID): Promise<T | null>;
	exists?(id: ID): Promise<boolean>;
	save(entity: T): Promise<void>;
	update?(id: ID, data: Record<string, unknown>): Promise<T>;
	delete(id: ID): Promise<void>;
}
