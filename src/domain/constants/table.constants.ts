export const TABLE_SHAPE = {
	SQUARE: "SQUARE",
	CIRCLE: "CIRCLE",
} as const;

export type TableShapeType = (typeof TABLE_SHAPE)[keyof typeof TABLE_SHAPE];

export const TABLE_SHAPE_VALUES = Object.values(TABLE_SHAPE);

export const TABLE_CAPACITY_MIN = 1;

export const TABLE_STATUS = {
	AVAILABLE: "AVAILABLE",
	OCCUPIED: "OCCUPIED",
	PARTIAL_OCCUPIED: "PARTIAL_OCCUPIED",
	MAINTENANCE: "MAINTENANCE",
} as const;

export type TableStatusType = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

