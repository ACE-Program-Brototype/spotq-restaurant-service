export interface IBaseRepository<T, ID = string> {
	findById(id: ID): Promise<T | null>;
	save(entity: T): Promise<void>;
	update(entity: T): Promise<void>;
	delete(id: ID): Promise<void>;
}
