export declare type Point = {
	x: number;
	y: number;
};

export declare type DataRange = {
	start: number;
	end: number;
};

export declare type Size = {
	width: number;
	height: number;
};

export declare type Padding = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export declare type GridPosition = {
	row: {
		start: number;
		end: number;
	};
	column: {
		start: number;
		end: number;
	};
};

export declare type AxisGrid = {
	amount: number;
	color: string;
	width: number;
};

export declare type Font = {
	family: string;
	size: number
};

export declare type Bounds = {
	min: number;
	max: number;
};

export declare interface AxisData extends Bounds {
	scale: number;
	translate: number;
}
