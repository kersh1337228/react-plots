import {
    ObjectGeometrical,
    ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical
} from '../../../utils_refactor/types/plotData';
import {
    JSX
} from 'react';
import {
    plotDataType
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    Bounds,
    DataRange
} from '../../../utils_refactor/types/display';
import {
    AxesReal
} from '../axes/Axes';
import NumberRange from '../../../utils_refactor/classes/iterable/NumberRange';
import {
    round
} from '../../../utils_refactor/functions/numberProcessing';

export declare type DrawingData = {
    x: Bounds;
    y: Bounds;
};

export declare type DrawingProps<
    StyleT extends Record<string, any>
> = {
    data: PlotData[];
    name: string;
    style?: StyleT;
    vfield?: string;
};

export default abstract class Drawing<
    GeometryT extends Object,
    StyleT extends Record<string, any>
> {
    // @ts-ignore
    public axes: AxesReal;
    protected readonly global: DrawingData;
    public local: DrawingData;
    protected readonly dtype: PlotDataName;
    public visible: boolean = true;

    protected constructor(
        protected data: PlotData[],
        public readonly name: string,
        protected geometry: GeometryT,
        public style: StyleT,
        public vfield?: string
    ) {
        let xs: number[], ys: number[], x: Bounds;
        const dtype = plotDataType(data) as PlotDataName;

        if (dtype.includes('Geometrical')) {
            if (dtype.includes('Point'))
                xs = (data as PointGeometrical[])
                    .map(point => point[0]);
            else
                xs = (data as ObjectGeometrical[])
                    .map(point => point.timestamp);
            x = {
                min: Math.min.apply(null, xs),
                max: Math.max.apply(null, xs)
            };
        } else
            x = {
                min: 0,
                max: data.length
            };

        if (dtype.includes('Point'))
            ys = (data as PointGeometrical[])
                .map(point => point[1])
                .filter(y => y !== null) as number[];
        else
            ys = (data as ObjectGeometrical[])
                .map(point => point[vfield as string])
                .filter(y => y !== null) as number[];

        this.dtype = dtype;
        this.global = {
            x, y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        };
        this.local = { ...this.global };
    }

    public localize(
        range: DataRange
    ): void {
        const localData = this.data.slice(
            Math.floor(this.data.length * range.start),
            Math.ceil(this.data.length * range.end)
        )

        let ys: number[];
        if (this.dtype.includes('Point'))
            ys = (localData as PointGeometrical[])
                .map(point => point[1] as number)
                .filter(y => y !== null);
        else
            ys = (localData as ObjectGeometrical[])
                .map(point => point[this.vfield as string] as number)
                .filter(y => y !== null);

        this.local = {
            x: {
                min: range.start * this.global.x.max,
                max: range.end * this.global.x.max
            },
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        };
    }

    public globalize(
        localX: number
    ): number {
        if (this.dtype.includes('Geometrical'))
            return (this.axes.axis.x.data as NumberRange).indexOf((
                localX - this.axes.transformMatrix.e
            ) / this.axes.transformMatrix.a) as number;
        else
            return Math.floor((
                localX * this.axes.density - this.axes.transformMatrix.e
            ) / this.axes.transformMatrix.a);
    }

    public point(at: number): PointGeometrical {
        switch (this.dtype) {
            case "PointGeometrical":
                return this.data[at] as PointGeometrical;
            case "PointTimeSeries":
                return [at + 0.55, this.data[at][1]];
            case "ObjectGeometrical":
                const point = this.data[at] as ObjectGeometrical;
                return [point.timestamp, point[this.vfield as string]];
            case "ObjectTimeSeries":
                return [at + 0.55, (
                    this.data[at] as ObjectTimeSeries
                )[this.vfield as string]];
        }
    }

    public tooltip(
        localX: number
    ): JSX.Element {
        const point = this.data[this.globalize(localX)];
        if (this.dtype.includes('Point'))
            return <li key={this.name} className={'drawingTooltips'}>
                {this.name}: {round(point[1] as number, 2)}
            </li>;
        else
            return <li key={this.name} className={'drawingTooltips'}>
                <ul>
                    {Object.entries(point).map(([key, value]) =>
                        <li key={key}>{this.name}: {round(value as number, 2)}</li>
                    )}
                </ul>
            </li>;
    }

    public abstract draw(): void;

    public abstract drawTooltip(
        localX: number
    ): void;

    public abstract settings(): JSX.Element;
}
