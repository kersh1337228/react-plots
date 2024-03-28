import {
    PointGeometrical,
    PointTimeSeries
} from '../../../../../utils_refactor/types/plotData';
import useData from '../base';
import {
    DrawingData
} from '../base';
import {
    round
} from '../../../../../utils_refactor/functions/numberProcessing';

export default function usePointData<
    DataT extends PointGeometrical | PointTimeSeries
>(
    global: DrawingData<DataT>,
    type: 'PointGeometrical' | 'PointTimeSeries'
) {
    const data = useData(global, type);

    function showTooltip(
        globalX: number,
        name: string
    )  {
        const [_, yi] = global.data[globalX];
        return <li key={name} className={'drawingTooltips'}>
            {name}: {round(yi as number, 2)}
        </li>;
    }

    return {
        ...data,
        showTooltip
    };
}
