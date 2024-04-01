type DataPoint<T extends number | string> = [ T, number | null ];
type DataObject<T extends number | string> = {
	timestamp: T
	[ numericType: string ]: number | null
	[ anyType: string ]: any
};

export declare type PointNumeric = DataPoint<number>;
export declare type ObjectNumeric = DataObject<number>;
export declare type Numeric = PointNumeric | ObjectNumeric;

export declare type PointTimeSeries = DataPoint<string>;
export declare type ObjectTimeSeries = DataObject<string>;
export declare type TimeSeries = PointTimeSeries | ObjectTimeSeries;

export declare type Point = PointNumeric | PointTimeSeries;
export declare type Object = ObjectNumeric | ObjectTimeSeries;

export declare interface Quotes extends ObjectTimeSeries {
	open: number | null
	high: number | null
	low: number | null
	close: number | null
	volume: number | null
}

export declare type PlotData = Numeric | TimeSeries;
export declare type PlotDataName =
	'PointNumeric'
	| 'ObjectNumeric'
	| 'PointTimeSeries'
	| 'ObjectTimeSeries';
export declare type VectorizedPlotDataName = 'Numeric' | 'TimeSeries';
