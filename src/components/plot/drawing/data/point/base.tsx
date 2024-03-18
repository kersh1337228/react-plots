import {
    PointGeometrical,
    PointTimeSeries
} from '../../../../../utils/types/plotData';
import { DataWrapper } from '../base';
import { DrawingData } from '../../base';
import { round } from '../../../../../utils/functions/numberProcessing';

export default abstract class PointDataWrapper<
    DataT extends PointGeometrical | PointTimeSeries
> extends DataWrapper<DataT> {
    public constructor(
        global: DrawingData<DataT>
    ) {
        super(global);
    }

    public override showTooltip(globalX: number, name: string) {
        const [_, yi] = this.pointAt(globalX);
        return <li key={name} className={'drawingTooltips'}>
            {name}: {round(yi as number, 2)}
        </li>;
    }
}