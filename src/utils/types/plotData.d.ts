type DataPoint<T extends number | string> = [ T, number | null ];
type DataObject<T extends number | string> = {
	timestamp: T;
	[ numericType: string ]: number | null;
	[ anyType: string ]: any;
};

export type PointNumeric = DataPoint<number>;
export type ObjectNumeric = DataObject<number>;
export type Numeric = PointNumeric | ObjectNumeric;

export type PointTimeSeries = DataPoint<string>;
export type ObjectTimeSeries = DataObject<string>;
export type TimeSeries = PointTimeSeries | ObjectTimeSeries;

export type Point = PointNumeric | PointTimeSeries;
export type Object = ObjectNumeric | ObjectTimeSeries;

export interface Quotes extends ObjectTimeSeries {
	open: number | null;
	high: number | null;
	low: number | null;
	close: number | null;
	volume: number | null;
}

export type PlotData = Numeric | TimeSeries;
export type PlotDataName =
	'PointNumeric'
	| 'ObjectNumeric'
	| 'PointTimeSeries'
	| 'ObjectTimeSeries';
export type VectorizedPlotDataName = 'Numeric' | 'TimeSeries';
