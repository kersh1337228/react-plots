import {
    ObjectGeometrical, ObjectTimeSeries,
    PlotData,
    PlotDataName,
    PointGeometrical,
    PointTimeSeries
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
    DrawingData
} from './data/base';
import {
    axesContext
} from '../axes/Axes';
import usePointGeometricalData from './data/point/geometrical';
import usePointTimeSeriesData from './data/point/timeSeries';
import useObjectGeometricalData from './data/object/geometrical';
import useObjectTimeSeriesData from './data/object/timeSeries';

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
    data: {
        local: Omit<DrawingData<PlotData>, 'data'>;
        vfield?: string;
    };
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

    let data;
    const dtype = plotDataType(global) as PlotDataName;
    switch (dtype) {
        case 'PointGeometrical':
            data = usePointGeometricalData(global as PointGeometrical[]);
            break;
        case 'PointTimeSeries':
            data = usePointTimeSeriesData(global as PointTimeSeries[]);
            break;
        case 'ObjectGeometrical':
            data = useObjectGeometricalData(
                global as ObjectGeometrical[], vfield as string);
            break;
        case 'ObjectTimeSeries':
            data = useObjectTimeSeriesData(
                global as ObjectTimeSeries[], vfield as string);
    }

    const context = useContext(axesContext);
    useEffect(() => {
        const copy = { ...context };
        copy.drawings[name] = {
            style,
            visible: true,
            data: {
                local: {
                    x: data.local.x,
                    y: data.local.y
                },
                vfield
            }
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
        data
    };
}
