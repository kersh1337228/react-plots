import {
    ObjectGeometrical, ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical,
    PointTimeSeries
} from '../../../utils/types/plotData';
import { useMemo, useRef, useState, Dispatch, SetStateAction } from 'react';
import { usePointGeometricalData } from './data/point/geometrical';
import { usePointTimeSeriesData } from './data/point/timeSeries';
import { useObjectGeometricalData } from './data/object/geometrical';
import { useObjectTimeSeriesData } from './data/object/timeSeries';
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
    style?: StyleT;
    name?: string;
    vfield?: string;
};

type DrawingState<
    GeometryT extends any,
    StyleT extends Record<string, any>
> = {
    geometry: GeometryT;
    style: StyleT;
    name: string;
    visible: boolean;
    settings: boolean;
};

// export default abstract class Drawing<
//     DataT extends PlotData,
//     GeometryT extends any,
//     StyleT extends Record<string, any>
// > {
//     protected readonly data: DataWrapper<DataT>;
//     public readonly dtype: PlotDataName;
//     protected visible: boolean;
//     protected settings: boolean;
//
//     protected constructor(
//         data: DataT[],
//         protected geometry: GeometryT,
//         protected readonly name: string,
//         protected style: StyleT,
//         vfield?: string
//     ) {
//         this.dtype = plotDataType(data) as PlotDataName;
//         switch (this.dtype) {
//             case 'PointGeometrical':
//                 this.data = new PointGeometricalDataWrapper(
//                     data as PointGeometrical[]) as DataWrapper<DataT>;
//                 break;
//             case 'PointTimeSeries':
//                 this.data = new PointTimeSeriesDataWrapper(
//                     data as PointTimeSeries[]) as DataWrapper<DataT>;
//                 break;
//             case 'ObjectGeometrical':
//                 this.data = new ObjectGeometricalDataWrapper(
//                     data as ObjectGeometrical[],
//                     vfield as string) as unknown as DataWrapper<DataT>;
//                 break;
//             case 'ObjectTimeSeries':
//                 this.data = new ObjectTimeSeriesDataWrapper(
//                     data as ObjectTimeSeries[],
//                     vfield as string) as unknown as DataWrapper<DataT>;
//         }
//         this.visible = true;
//         this.settings = false;
//     };
//
//     public abstract plot( // TODO: other context types
//         ctx: CanvasRenderingContext2D
//     ): Promise<void>;
//
//     public abstract showStyle(): React.JSX.Element;
//
//     public abstract drawTooltip( // TODO: too much args
//         ctx: CanvasRenderingContext2D,
//         globalX: number,
//         xs: number,
//         xt: number,
//         ys: number,
//         yt: number,
//         density: number
//     ): Promise<void>;
// }

export function useDrawing<
    DataT extends PlotData,
    GeometryT extends any,
    StyleT extends Record<string, any>
>(
    global: DataT[],
    style: StyleT,
    name?: string,
    vfield?: string
) {
    const [state, setState] = useState({
        style,
        name,
        visible: true,
        settings: false
    });

    const data = useMemo(() => {
        const dtype = plotDataType(global) as PlotDataName;
        switch (dtype) {
            case 'PointGeometrical':
                return usePointGeometricalData(global as PointGeometrical[]);
            case 'PointTimeSeries':
                return usePointTimeSeriesData(global as PointTimeSeries[]);
            case 'ObjectGeometrical':
                return useObjectGeometricalData(
                    global as ObjectGeometrical[], vfield as string);
            case 'ObjectTimeSeries':
                return useObjectTimeSeriesData(
                    global as ObjectTimeSeries[], vfield as string);
        }
    }, []);

    return {
        state,
        setState,
        data
    };
}
