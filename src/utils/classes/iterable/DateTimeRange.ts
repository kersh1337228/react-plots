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
		freq: Duration = Duration.days(1)
	) {
		const first = new DateTime(start),
			last = new DateTime(end);

		const n = DateTime.diff(last, first).milliseconds / freq.milliseconds;
		super(
			new Array<DateTime>(n),
			freq,
			1
		);

		for (let i = 0; i < n; ++i)
			this.container[i] = new DateTime(new Date(
				first.object.getTime() + i * freq.milliseconds));
	};

	public override format(fstring: string): string[] {
		return this.container.map(
			dt => dt.format(fstring));
	};

	public override at(i: number): DateTime | undefined {
		return this.container.at(i);
	};

	public override formatAt(
		i: number,
		fstring: string
	) {
		return this.container.at(i)?.format(fstring);
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
		drawings: React.ReactElement<DrawingProps<any>>[]
	): DateTimeRange {
		const dates = [...new Set(([] as Array<number>)
			.concat(...drawings.map(drawing => {
				if (plotDataType(drawing.props.data) === 'PointTimeSeries')
					return (drawing.props.data as PointTimeSeries[]).map(arr =>
						new Date(arr[0]).getTime());
				else
					return (drawing.props.data as ObjectTimeSeries[]).map(arr =>
						new Date(arr.timestamp).getTime());
			})).sort((a, b) => a > b ? 1 : a < b ? -1 : 0))];

		let freq = Infinity;
		for (let i = 1; i < dates.length; ++i) {
			const delta = dates[i] - dates[i - 1];
			freq = delta < freq ? delta : freq;
		}

		return new DateTimeRange(
			new Date(dates[0]),
			new Date(dates.at(-1) as number),
			Duration.milliseconds(freq)
		);
	};
}
