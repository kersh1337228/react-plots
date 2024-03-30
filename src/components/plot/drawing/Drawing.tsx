import {
    ObjectGeometrical,
    ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical
} from '../../../utils_refactor/types/plotData';
import {
    useContext,
    useEffect,
    useState
} from 'react';
import {
    plotDataType
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    axesContext
} from '../axes/Axes';
import { Bounds, DataRange } from '../../../utils_refactor/types/display';
import { round } from '../../../utils_refactor/functions/numberProcessing';
import NumberRange from '../../../utils_refactor/classes/iterable/NumberRange';

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
    vfield?: string;
};

export declare type DrawingComponent = React.FunctionComponentElement<
    DrawingProps<Record<string, any>>
> & React.JSX.Element;

export declare type DrawingState = {

}

export declare type DrawingContext = {
    style: Record<string, any>;
    visible: boolean;
    global: DrawingData<PlotData>;
    local: DrawingData<PlotData>;
    vfield?: string;

    localize: (range: DataRange) => DrawingData<PlotData>;
}

export function useDrawing<
    DataT extends PlotData,
    StyleT extends Record<string, any>
>(
    global: DataT[],
    style: StyleT,
    name: string,
    vfield?: string
) {
    const [state, setState] = useState({
        style,
        name,
        visible: true,
        settings: false
    });

    const dtype = plotDataType(global) as PlotDataName;
    const context = useContext(axesContext);
    const self = context.drawings[name];

    function localize(range: DataRange): DrawingData<PlotData> {
        const local = {
            x: {
                min: range.start * self.global.x.max,
                max: range.end * self.global.x.max
            },
            data: global.slice(
                Math.floor(global.length * range.start),
                Math.ceil(global.length * range.end)
            )
        };

        let ys: number[];
        if (dtype.includes('Point'))
            ys = (local.data as PointGeometrical[])
                .map(point => point[1] as number)
                .filter(y => y !== null);
        else
            ys = (local.data as ObjectGeometrical[])
                .map(point => point[vfield as string] as number)
                .filter(y => y !== null);

        return {
            ...local,
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        };
    }

    function globalize(
        x: number
    ): number {
        if (dtype.includes('Geometrical'))
            return (context.axis.x.data as NumberRange).indexOf((
                x - context.transformMatrix.e
            ) / context.transformMatrix.a) as number;
        else
            return Math.floor((
                x * context.density - context.transformMatrix.e
            ) / context.transformMatrix.a);
    }

    function pointAt(i: number): PointGeometrical {
        switch (dtype) {
            case "PointGeometrical":
                return global[i] as PointGeometrical;
            case "PointTimeSeries":
                return [i + 0.55, global[i][1]];
            case "ObjectGeometrical":
                const data = global[i] as ObjectGeometrical;
                return [data.timestamp, data[vfield as string]];
            case "ObjectTimeSeries":
                return [i + 0.55, (
                    global[i] as ObjectTimeSeries
                )[self.vfield as string]];
        }
    }

    function showTooltip(
        globalX: number,
        name: string
    )  {
        const point = global[globalX];
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

    useEffect(() => {
        let xs: number[], ys: number[], x: Bounds;

        if (dtype.includes('Geometrical')) {
            if (dtype.includes('Point')) {
                xs = (global as PointGeometrical[])
                    .map(point => point[0]);
            } else {
                xs = (global as ObjectGeometrical[])
                    .map(point => point.timestamp);
            }
            x = {
                min: Math.min.apply(null, xs),
                max: Math.max.apply(null, xs)
            };
        } else {
            x = {
                min: 0,
                max: global.length
            };
        }

        if (dtype.includes('Point')) {
            ys = (global as PointGeometrical[])
                .map(point => point[1])
                .filter(y => y !== null) as number[];
        } else {
            ys = (global as ObjectGeometrical[])
                .map(point => point[vfield as string])
                .filter(y => y !== null) as number[];
        }
        const data = {
            data: global, x,
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        };

        const copy = { ...context };
        copy.drawings[name] = {
            style,
            visible: true,
            global: data,
            local: {
                data: [...data.data],
                x: { ...data.x },
                y: { ...data.y }
            },
            vfield
        };
        context.dispatch(copy);
    }, [
        // data.local.x.min,
        // data.local.x.max,
        // data.local.y.min,
        // data.local.y.max
    ]);

    return {
        state,
        setState,
        localize,
        globalize,
        pointAt,
        showTooltip
    };
}
