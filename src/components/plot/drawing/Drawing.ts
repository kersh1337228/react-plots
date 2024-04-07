import {
    ObjectNumeric,
    ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointNumeric, PointTimeSeries
} from '../../../utils_refactor/types/plotData';
import {
    JSX
} from 'react';
import {
    plotDataType
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    AxesReal
} from '../axes/single/Axes';
import PointNumericData from './data/point/numeric';
import DrawingData from './data/base';
import PointTimeSeriesData from './data/point/timeSeries';
import ObjectNumericData from './data/object/numeric';
import ObjectTimeSeriesData from './data/object/timeSeries';

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
    public data: DrawingData<any>;
    public visible: boolean = true;

    protected constructor(
        data: PlotData[],
        public readonly name: string,
        protected geometry: GeometryT,
        public style: StyleT,
        vfield?: string
    ) {
        const dtype = plotDataType(data) as PlotDataName;
        switch (dtype) {
            case 'PointNumeric':
                this.data = new PointNumericData(
                    this, data as PointNumeric[]);
                break;
            case 'PointTimeSeries':
                this.data = new PointTimeSeriesData(
                    this, data as PointTimeSeries[]);
                break;
            case 'ObjectNumeric':
                this.data = new ObjectNumericData(
                    this, data as ObjectNumeric[], vfield as string);
                break;
            case 'ObjectTimeSeries':
                this.data = new ObjectTimeSeriesData(
                    this, data as ObjectTimeSeries[], vfield as string);
        }
    }

    public abstract draw(): void;

    public abstract drawTooltip(
        localX: number
    ): void;

    public abstract settings(): JSX.Element;
}
