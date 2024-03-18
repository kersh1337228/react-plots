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

export default abstract class Drawing<
    DataT extends PlotData,
    GeometryT extends Path2D,
    StyleT extends Record<string, any>
> {
    protected readonly data: DataWrapper<DataT>;
    protected visible: boolean;
    protected settings: boolean;

    protected constructor(
        data: DataT[],
        dtype: PlotDataName,
        protected geometry: GeometryT,
        protected readonly name: string,
        protected style: StyleT,
        vfield?: string
    ) {
        switch (dtype) {
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
