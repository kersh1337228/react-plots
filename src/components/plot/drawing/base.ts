import {
    ObjectGeometrical, ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical,
    PointTimeSeries
} from '../../../utils/types/plotData';
import React, { useState } from 'react';
import { DataWrapper } from './data/base';
import PointGeometricalDataWrapper, { usePointGeometricalData } from './data/point/geometrical';
import PointTimeSeriesDataWrapper, { usePointTimeSeriesData } from './data/point/timeSeries';
import ObjectGeometricalDataWrapper, { useObjectGeometricalData } from './data/object/geometrical';
import ObjectTimeSeriesDataWrapper, { useObjectTimeSeriesData } from './data/object/timeSeries';
import { plotDataType } from '../../../utils/functions/plotDataProcessing';

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

export function useDrawing<
    DataT extends PlotData,
    GeometryT extends any,
    StyleT extends Record<string, any>
>(
    data: DataT[],
    geometry: GeometryT,
    style: StyleT,
    name?: string,
    vfield?: string
) {
    const [state, setState] = useState({
        geometry,
        style,
        name,
        visible: true,
        settings: false
    });
    const dtype = plotDataType(data) as PlotDataName;
    switch (dtype) {
        case 'PointGeometrical':
            dataWrapper = new PointGeometricalDataWrapper(
                data as PointGeometrical[]) as DataWrapper<DataT>;
            break;
        case 'PointTimeSeries':
            dataWrapper = new PointTimeSeriesDataWrapper(
                data as PointTimeSeries[]) as DataWrapper<DataT>;
            break;
        case 'ObjectGeometrical':
            dataWrapper = new ObjectGeometricalDataWrapper(
                data as ObjectGeometrical[],
                vfield as string) as unknown as DataWrapper<DataT>;
            break;
        case 'ObjectTimeSeries':
            dataWrapper = new ObjectTimeSeriesDataWrapper(
                data as ObjectTimeSeries[],
                vfield as string) as unknown as DataWrapper<DataT>;
    }

}
