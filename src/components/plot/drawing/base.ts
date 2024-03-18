import {
    ObjectGeometrical, ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical,
    PointTimeSeries
} from '../../../utils/types/plotData';
import React from 'react';
import { DataWrapper } from './data/base';
import PointGeometricalDataWrapper from './data/point/geometrical';
import PointTimeSeriesDataWrapper from './data/point/timeSeries';
import ObjectGeometricalDataWrapper from './data/object/geometrical';
import ObjectTimeSeriesDataWrapper from './data/object/timeSeries';
import { plotDataType } from '../../../utils/functions/plotDataProcessing';
import { HistStyleT } from './Hist';

export declare type Bounds = {
    min: number;
    max: number;
};

export declare type DrawingData<
    DataT extends PlotData
> = {
    data: DataT[];
    x: Bounds;
    y: Bounds;
};

export declare type DrawingProps<
    StyleT extends Record<string, any>
> = {
    data: PlotData[];
    name: string;
    style?: StyleT;
};

export default abstract class Drawing<
    DataT extends PlotData,
    GeometryT extends any,
    StyleT extends Record<string, any>
> {
    protected readonly data: DataWrapper<DataT>;
    public readonly dtype: PlotDataName;
    protected visible: boolean;
    protected settings: boolean;

    protected constructor(
        data: DataT[],
        protected geometry: GeometryT,
        protected readonly name: string,
        protected style: StyleT,
        vfield?: string
    ) {
        this.dtype = plotDataType(data) as PlotDataName;
        switch (this.dtype) {
            case 'PointGeometrical':
                this.data = new PointGeometricalDataWrapper(
                    data as PointGeometrical[]) as DataWrapper<DataT>;
                break;
            case 'PointTimeSeries':
                this.data = new PointTimeSeriesDataWrapper(
                    data as PointTimeSeries[]) as DataWrapper<DataT>;
                break;
            case 'ObjectGeometrical':
                this.data = new ObjectGeometricalDataWrapper(
                    data as ObjectGeometrical[],
                    vfield as string) as unknown as DataWrapper<DataT>;
                break;
            case 'ObjectTimeSeries':
                this.data = new ObjectTimeSeriesDataWrapper(
                    data as ObjectTimeSeries[],
                    vfield as string) as unknown as DataWrapper<DataT>;
        }
        this.visible = true;
        this.settings = false;
    };

    public abstract plot( // TODO: other context types
        ctx: CanvasRenderingContext2D
    ): Promise<void>;

    public abstract showStyle(): React.JSX.Element;

    public abstract drawTooltip( // TODO: too much args
        ctx: CanvasRenderingContext2D,
        globalX: number,
        xs: number,
        xt: number,
        ys: number,
        yt: number,
        density: number
    ): Promise<void>;
}
