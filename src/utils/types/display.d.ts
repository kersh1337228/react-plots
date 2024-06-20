export type RecursivePartial<T> = {
	[P in keyof T]?:
	T[P] extends (infer U)[] ? RecursivePartial<U>[] :
		T[P] extends object | undefined ? RecursivePartial<T[P]> :
			T[P];
};

export type Point = {
	x: number;
	y: number;
};

export type DataRange = {
	start: number;
	end: number;
};

export type Size = {
	width: number;
	height: number;
};

export type Padding = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export type GridPosition = {
	row: {
		start: number;
		end: number;
	};
	column: {
		start: number;
		end: number;
	};
};

export type AxisGrid = {
	amount: number;
	color: string;
	width: number;
};

export type Font = {
	family: string;
	size: number
};

export type Bounds = {
	min: number;
	max: number;
};

export interface AxisData extends Bounds {
	scale: number;
	translate: number;
}
