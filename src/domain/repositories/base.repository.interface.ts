export interface PaginationOptions<TWhere = unknown, TOrderBy = unknown> {
	where?: TWhere;
	orderBy?: TOrderBy;
	page: number;
	limit: number;
}

export interface PaginatedResult<TDomain> {
	items: TDomain[];
	total: number;
}

export interface IBaseRepository<T, ID = string> {
	findById(id: ID): Promise<T | null>;
	exists?(id: ID): Promise<boolean>;
	save(entity: T): Promise<void>;
	update?(id: ID, data: Record<string, unknown>): Promise<T>;
	delete(id: ID): Promise<void>;
	create(entity: T): Promise<T>;
	findPaginated<TWhere = unknown, TOrderBy = unknown>(
		options: PaginationOptions<TWhere, TOrderBy>,
	): Promise<PaginatedResult<T>>;
}
