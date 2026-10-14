import {
	TABLE_SHAPE_VALUES,
	TABLE_STATUS,
	type TableShapeType,
	type TableStatusType,
} from "@domain/constants/table.constants";
import { RestaurantIdRequiredError } from "@domain/errors/restaurant.errors";
import { TableSectionIdRequiredError } from "@domain/errors/table-section.errors";
import {
	InvalidTableCapacityError,
	InvalidTableNumberError,
	InvalidTableShapeError,
} from "@domain/errors/table.errors";

export interface TablePropsType {
	id: string;
	restaurantId: string;
	sectionId: string;
	tableNumber: string;
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
	tableNumber: string;
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

		// throw if tableNumber is invalid
		const tableNumber = props.tableNumber.trim();
		if (tableNumber.length < 1 || tableNumber.length > 50) {
			throw new InvalidTableNumberError();
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
		const sectionId = props.sectionId.trim()
		if(!sectionId){
			throw new TableSectionIdRequiredError()
		}

		// generates Id if not provided
		const id = props.id || crypto.randomUUID();

		const now = new Date();

		return new Table({
			id,
			sectionId,
			restaurantId,
			tableNumber,
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
			tableNumber: props.tableNumber,
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

	get id() {
		return this.props.id;
	}

	get restaurantId() {
		return this.props.restaurantId;
	}

	get sectionId() {
		return this.props.sectionId;
	}

	get tableNumber() {
		return this.props.tableNumber;
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
