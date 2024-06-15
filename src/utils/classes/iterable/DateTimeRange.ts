import React from 'react';
import {
	DateTime,
	Duration
} from "../dataTypes/dateTime"
import TypedRange from "./TypedRange"
import {
	plotDataType
} from "../../functions/plotDataProcessing"
import {
	ObjectTimeSeries,
	PointTimeSeries
} from "../../types/plotData"
import {
	DrawingProps
} from '../../../components/plot/drawing/base/Drawing';

export default class DateTimeRange extends TypedRange<
	DateTime,
	Duration
> {
	public constructor(
		start: DateTime | Date | string,
		end: DateTime | Date | string,
		freq: Duration
	);

	public constructor(
		container: number[],
		freq: Duration
	);

	public constructor(
		startOrContainer: (DateTime | Date | string) | number[],
		endOrFreq: (DateTime | Date | string) | Duration,
		freq?: Duration
	) {
		if (freq === undefined) {
			super(
				(startOrContainer as number[]).map(
					timestamp => new DateTime(
						new Date(timestamp)
					)
				),
				endOrFreq as Duration,
				1
			);
		} else {
			const first = new DateTime(
				startOrContainer as DateTime | Date | string);
			const last = new DateTime(
				endOrFreq as DateTime | Date | string);

			const n = DateTime.diff(last, first).milliseconds / freq.milliseconds;
			super(
				new Array<DateTime>(n),
				freq,
				1
			);

			for (let i = 0; i < n; ++i)
				this.container[i] = new DateTime(
					new Date(
						first.object.getTime() + i * freq.milliseconds
					)
				);
		}
	};

	public override format(
		fstring?: string
	): string[] {
		return this.container.map(
			dt => dt.format(fstring ?? this.freq.format)
		);
	};

	public override at(i: number): DateTime | undefined {
		return this.container.at(i);
	};

	public override formatAt(
		i: number,
		fstring?: string
	) {
		return this.container.at(i)?.format(
			fstring ?? this.freq.format
		);
	};

	public override slice(
		start: number,
		end: number
	): DateTimeRange {
		return new DateTimeRange(
			this.container[start],
			this.container[Math.max(0, end - 1)],
			this.freq
		);
	};

	public static plotDateTimeRange(
		drawings: React.ReactElement<DrawingProps<any>>[],
		fill: boolean = false
	): DateTimeRange {
		const dates = [...new Set(([] as Array<number>)
			.concat(...drawings.map(drawing => {
				if (plotDataType(drawing.props.data) === 'PointTimeSeries')
					return (drawing.props.data as PointTimeSeries[]).map(
						arr => Date.parse(arr[0])
					);
				else
					return (drawing.props.data as ObjectTimeSeries[]).map(
						arr => Date.parse(arr.timestamp)
					);
			})).sort((a, b) => a > b ? 1 : a < b ? -1 : 0))];

		let freq = Infinity;
		for (let i = 1; i < dates.length; ++i) {
			const delta = dates[i] - dates[i - 1];
			freq = delta < freq ? delta : freq;
		}

		if (fill)
			return new DateTimeRange(
				new Date(dates[0]),
				new Date(dates.at(-1) as number),
				Duration.milliseconds(freq)
			);
		else
			return new DateTimeRange(
				dates,
				Duration.milliseconds(freq)
			);
	};
}
