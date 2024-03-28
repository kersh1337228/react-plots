import {
    PlotData,
    PlotDataName
} from '../../../../utils_refactor/types/plotData';
import {
    Bounds,
    DataRange
} from '../../../../utils_refactor/types/display';
import {
    useState
} from 'react';

export declare type DrawingData<
    DataT extends PlotData
> = {
    data: DataT[];
    x: Bounds;
    y: Bounds;
};

export default function useData<
    DataT extends PlotData
>(
    global: DrawingData<DataT>,
    type: PlotDataName
) {
    const [local, setLocal] = useState({
        ...global,
        x: { ...global.x },
        y: { ...global.y }
    });

    function localize(range: DataRange) {
        return {
            ...local,
            x: {
                min: range.start * global.x.max,
                max: range.end * global.x.max
            },
            data: global.data.slice(
                Math.floor(global.data.length * range.start),
                Math.ceil(global.data.length * range.end)
            )
        };
    }

    return {
        global,
        local,
        setLocal,
        type,
        localize,
    };
}
