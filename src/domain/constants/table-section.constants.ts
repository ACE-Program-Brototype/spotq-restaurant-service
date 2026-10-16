export const TABLE_SECTION_MODE = {
	ALL: "ALL",
	PAGINATED: "PAGINATED",
};

export type TableSectionMode =
	(typeof TABLE_SECTION_MODE)[keyof typeof TABLE_SECTION_MODE];
