import {
    ObjectGeometrical,
    ObjectTimeSeries
} from '../../../../../utils_refactor/types/plotData';
import useData from '../base';
import {
    DrawingData
} from '../base';
import {
    round
} from '../../../../../utils_refactor/functions/numberProcessing';

export default function useObjectData<
    DataT extends ObjectGeometrical | ObjectTimeSeries
>(
    global: DrawingData<DataT>,
    vfield: string,
    type: 'ObjectGeometrical' | 'ObjectTimeSeries'
) {
    const data = useData(global, type);

    function showTooltip(
        globalX: number,
        name: string
    ) {
        const obj = global.data[globalX];
        return <li key={name} className={'drawingTooltips'}>
            <ul>
                {Object.entries(obj).map(([key, value]) =>
                    <li key={key}>{name}: {round(value as number, 2)}</li>
                )}
            </ul>

        </li>;
    }

    return {
        ...data,
        vfield,
        showTooltip
    };
}
