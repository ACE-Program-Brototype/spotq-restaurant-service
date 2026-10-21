import {
	TABLE_SHAPE_VALUES,
	TABLE_STATUS,
	type TableShapeType,
	type TableStatusType,
} from "@domain/constants/table.constants";
import { RestaurantIdRequiredError } from "@domain/errors/restaurant.errors";
import {
	InvalidTableCapacityError,
	InvalidTableCodeError,
	InvalidTableShapeError,
	TableAlreadyOccupiedError,
	TableNotAvailableError,
} from "@domain/errors/table.errors";
import { TableSectionIdRequiredError } from "@domain/errors/table-section.errors";

export interface TablePropsType {
	id: string;
	restaurantId: string;
	sectionId: string;
	tableCode: string;
	capacity: number;
	currentOccupancy: number;
	tableShape: TableShapeType;
	status: TableStatusType;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	isDeleted: boolean;
}

export interface CreateTablePropsType {
	id?: string;
	restaurantId: string;
	sectionId: string;
	tableCode: string;
	capacity: number;
	tableShape: TableShapeType;
}

export type ReconstituteTableProps = TablePropsType;

export class Table {
	private constructor(private readonly props: TablePropsType) {}

	/**
	 * Used to create a new Table Instance
	 * @param props CreateTablePropsType
	 * @returns Table
	 */
	static create(props: CreateTablePropsType) {
		// throw if capacity is less than 1
		const capacity = props.capacity;
		if (!Number.isInteger(capacity) || capacity < 1) {
			throw new InvalidTableCapacityError();
		}

		// throw if tableCode is invalid
		const tableCode = props.tableCode.trim();
		if (tableCode.length < 1 || tableCode.length > 50) {
			throw new InvalidTableCodeError();
		}

		// throws if restaurantId not provided
		const restaurantId = props.restaurantId.trim();
		if (!restaurantId) {
			throw new RestaurantIdRequiredError();
		}

		if (!TABLE_SHAPE_VALUES.includes(props.tableShape)) {
			throw new InvalidTableShapeError();
		}

		// throws if sectionId not provided
		const sectionId = props.sectionId.trim();
		if (!sectionId) {
			throw new TableSectionIdRequiredError();
		}

		// generates Id if not provided
		const id = props.id || crypto.randomUUID();

		const now = new Date();

		return new Table({
			id,
			sectionId,
			restaurantId,
			tableCode,
			capacity,
			tableShape: props.tableShape,
			currentOccupancy: 0,
			createdAt: now,
			updatedAt: now,
			isActive: true,
			status: TABLE_STATUS.AVAILABLE,
			isDeleted: false,
		});
	}

	/**
	 * Used to reconstruct a Table Instance from existing value
	 * @param props ReconstituteTableProps
	 * @returns Table
	 */
	public static reconstitute(props: ReconstituteTableProps) {
		return new Table({
			id: props.id,
			sectionId: props.sectionId,
			restaurantId: props.restaurantId,
			tableCode: props.tableCode,
			capacity: props.capacity,
			tableShape: props.tableShape,
			currentOccupancy: props.currentOccupancy,
			createdAt: props.createdAt,
			updatedAt: props.updatedAt,
			isActive: props.isActive,
			status: props.status,
			isDeleted: props.isDeleted,
		});
	}

	isAvailable() {
		return (
			this.currentOccupancy === 0 && this.status === TABLE_STATUS.AVAILABLE
		);
	}

	public update(
		props: Partial<
			Pick<
				TablePropsType,
				"sectionId" | "tableCode" | "capacity" | "tableShape"
			>
		>,
	) {
		// valide the table code when provided
		if (props.tableCode !== undefined) {
			const tableCode = props.tableCode.trim();
			if (tableCode.length < 1 || tableCode.length > 50) {
				throw new InvalidTableCodeError();
			}
			this.props.tableCode = tableCode;
		}

		if (props.capacity !== undefined) {
			if (!Number.isInteger(props.capacity) || props.capacity < 1) {
				throw new InvalidTableCapacityError();
			}

			// prevent capacity when the table is occupied
			if (
				this.props.currentOccupancy > 0 &&
				props.capacity !== this.props.capacity
			) {
				throw new TableAlreadyOccupiedError();
			}
			this.props.capacity = props.capacity;
		}

		if (props.tableShape !== undefined) {
			if (!TABLE_SHAPE_VALUES.includes(props.tableShape)) {
				throw new InvalidTableShapeError();
			}
			this.props.tableShape = props.tableShape;
		}

		if (props.sectionId !== undefined) {
			const sectionId = props.sectionId.trim();
			if (!sectionId) {
				throw new TableSectionIdRequiredError();
			}

			this.props.sectionId = sectionId;
		}

		this.props.updatedAt = new Date();
	}

	releaseGuest(count: number) {
		console.log(count, '--------------------')
		if (!Number.isInteger(count) || count < 1) {
			throw new InvalidTableCapacityError();
		}
		if (
			this.status !== TABLE_STATUS.PARTIAL_OCCUPIED &&
			this.status !== TABLE_STATUS.OCCUPIED
		) {
			throw new TableNotAvailableError();
		}

		const newOccupancy = this.props.currentOccupancy - count;
		console.log(newOccupancy, '______')
		if (newOccupancy < 0) {
			throw new InvalidTableCapacityError();
		}

		this.props.currentOccupancy = newOccupancy;

		this.props.status =
			newOccupancy === 0
				? TABLE_STATUS.AVAILABLE
				: TABLE_STATUS.PARTIAL_OCCUPIED;

		this.props.updatedAt = new Date();
	}
	
	get id() {
		return this.props.id;
	}

	get restaurantId() {
		return this.props.restaurantId;
	}

	get sectionId() {
		return this.props.sectionId;
	}

	get tableCode() {
		return this.props.tableCode;
	}

	get capacity() {
		return this.props.capacity;
	}

	get currentOccupancy() {
		return this.props.currentOccupancy;
	}

	get tableShape() {
		return this.props.tableShape;
	}

	get status() {
		return this.props.status;
	}

	get isActive() {
		return this.props.isActive;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	get isDeleted() {
		return this.props.isDeleted;
	}
}
