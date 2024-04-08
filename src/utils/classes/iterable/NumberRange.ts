import TypedRange from "./TypedRange";
import {
	PlotData
} from "../../types/plotData";
import {
	DrawingProps
} from '../../../components/plot/drawing/base/Drawing';
import {
	epsComp, unique
} from '../../functions/numberProcessing';

export default class NumberRange extends TypedRange<
	number,
	number
> {
	public constructor(
		arrays: number[][]
	) {
		const init = unique(
			([] as number[]).concat(...arrays), epsComp(1e-12));

		let freq = Number.MAX_VALUE;
		for (let i = 1; i < init.length; ++i) {
			const step = init[i] - init[i - 1];
			freq = step < freq ? step : freq;
		}

		super(
			init,
			freq,
			freq
		);
	};

	public override format(
		fstring: string
	): string[] {
		const matches = [...fstring.matchAll(/%\.(\d*)f/g)];
		return this.container.map(num => {
			let fstr = fstring;
			for (const [format, match]  of matches)
				fstr = fstr.replace(
					format,
					String(
						Math.round(
							(num + Number.EPSILON) * 10 ** parseInt(match)
						) / 10 ** parseInt(match)
					)
				);
			return fstr;
		})
	};

	public override at(
		i: number
	): number | undefined {
		return this.container.at(i);
	};

	public override formatAt(
		i: number,
		fstring: string
	) {
		const num = this.container.at(i);
		if (num !== undefined) {
			const matches = fstring.matchAll(/%\.(\d*)f/g);
			let fstr = fstring;
			for (const [format, match] of matches)
				fstr = fstr.replace(
					format,
					String(
						Math.round(
							(num + Number.EPSILON) * 10 ** parseInt(match)
						) / 10 ** parseInt(match)
					)
				);
			return fstr;
		}

		return undefined;
	}

	public override slice(
		start?: number,
		end?: number
	): NumberRange {
		return new NumberRange([
			this.container.slice(start, end)]);
	};

	public nearest(
		val: number,
		tol: number = Infinity
	): number | undefined {
		const nearest_value = [...this.container].sort(
			(a, b) => Math.abs(a - val) < Math.abs(b - val) ? -1 : 1
		).at(0) as number
		return Math.abs(nearest_value - val) < tol ? nearest_value : undefined
	};

	public indexOf(
		val: number,
		tol: number = Infinity
	): number | undefined {
		const nearest_value = this.nearest(val, tol);
		return nearest_value !== undefined ?
			this.container.indexOf(nearest_value)
			: undefined;
	};

	public static plotNumberRange(
		drawings: React.ReactElement<DrawingProps<any>>[]
	): NumberRange {
		return new NumberRange(drawings.map(
			drawing => {
				const data = drawing.props.data as PlotData[];
				if ('timestamp' in data[0]) // @ts-ignore
					return data.map(point => point.timestamp);
				else
					return data.map(point => point[0]);
			}
		));
	};
};
