import {
    ObjectGeometrical,
    ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical
} from '../../../utils_refactor/types/plotData';
import {
    useContext
} from 'react';
import {
    plotDataType
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    axesContext
} from '../axes/Axes';
import { Bounds, DataRange } from '../../../utils_refactor/types/display';
import { round } from '../../../utils_refactor/functions/numberProcessing';

export declare type DrawingData = {
    // data: DataT[];
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

export declare type DrawingComponent = React.FunctionComponentElement<
    DrawingProps<Record<string, any>>
> & React.JSX.Element;

export declare type DrawingState = {}; // TODO: drawing state

export declare type DrawingContext = {
    style: Record<string, any>;
    visible: boolean;
    local: DrawingData;
    global: DrawingData;
    vfield?: string;
};

export function initDrawingContext(props: DrawingProps<any>): DrawingContext {
    let xs: number[], ys: number[], x: Bounds;
    const dtype = plotDataType(props.data) as PlotDataName;

    if (dtype.includes('Geometrical')) {
        if (dtype.includes('Point'))
            xs = (props.data as PointGeometrical[])
                .map(point => point[0]);
        else
            xs = (props.data as ObjectGeometrical[])
                .map(point => point.timestamp);
        x = {
            min: Math.min.apply(null, xs),
            max: Math.max.apply(null, xs)
        };
    } else
        x = {
            min: 0,
            max: props.data.length
        };

    if (dtype.includes('Point')) {
        ys = (props.data as PointGeometrical[])
            .map(point => point[1])
            .filter(y => y !== null) as number[];
    } else {
        ys = (props.data as ObjectGeometrical[])
            .map(point => point[props.vfield as string])
            .filter(y => y !== null) as number[];
    }
    const global = {
        x, y: {
            min: Math.min.apply(null, ys),
            max: Math.max.apply(null, ys)
        }
    };

    return {
        style: props.style,
        vfield: props.vfield,
        visible: true,
        global,
        local: { ...global }
    }
}

export function useDrawing<
    DataT extends PlotData,
    // StyleT extends Record<string, any>
>(
    data: DataT[],
    name: string
) {
    const dtype = plotDataType(data) as PlotDataName;
    const context = useContext(axesContext);
    const self = context.drawings[name];

    function localize(range: DataRange): Bounds {
        const local = {
            x: {
                min: range.start * self.global.x.max,
                max: range.end * self.global.x.max
            }
        };
        const localData = data.slice(
            Math.floor(global.length * range.start),
            Math.ceil(global.length * range.end)
        )

        let ys: number[];
        if (dtype.includes('Point'))
            ys = (localData as PointGeometrical[])
                .map(point => point[1] as number)
                .filter(y => y !== null);
        else
            ys = (localData as ObjectGeometrical[])
                .map(point => point[self.vfield as string] as number)
                .filter(y => y !== null);

        return {
            min: Math.min.apply(null, ys),
            max: Math.max.apply(null, ys)
        };
    }

    function globalize(
        x: number
    ): number {
        if (dtype.includes('Geometrical'))
            // TODO: x axis data access
            // return (context.axis.x.data as NumberRange).indexOf((
            //     x - context.transformMatrix.e
            // ) / context.transformMatrix.a) as number;
            return 0;
        else
            return Math.floor((
                x * context.density - context.transformMatrix.e
            ) / context.transformMatrix.a);
    }

    function pointAt(i: number): PointGeometrical {
        switch (dtype) {
            case "PointGeometrical":
                return data[i] as PointGeometrical;
            case "PointTimeSeries":
                return [i + 0.55, data[i][1]];
            case "ObjectGeometrical":
                const point = data[i] as ObjectGeometrical;
                return [point.timestamp, point[self.vfield as string]];
            case "ObjectTimeSeries":
                return [i + 0.55, (
                    data[i] as ObjectTimeSeries
                )[self.vfield as string]];
        }
    }

    function showTooltip(
        globalX: number,
        name: string
    )  {
        const point = data[globalX];
        if (dtype.includes('Point'))
            return <li key={name} className={'drawingTooltips'}>
                {name}: {round(point[1] as number, 2)}
            </li>;
        else
            return <li key={name} className={'drawingTooltips'}>
                <ul>
                    {Object.entries(point).map(([key, value]) =>
                        <li key={key}>{name}: {round(value as number, 2)}</li>
                    )}
                </ul>

            </li>;
    }

    return {
        ...self,
        dispatch: context.dispatch,
        localize,
        globalize,
        pointAt,
        showTooltip
    };
}
