import { LineBase } from '../base';
import { PointGeometrical } from '../../../../../utils/types/plotData';
import { LineStyle } from '../../../../plot_refactor/drawings/Line/LineBase';

export default class LinePointGeometrical extends LineBase<PointGeometrical> {
    public constructor(
        data: PointGeometrical[],
        name: string,
        style?: LineStyle
    ) {
        super(
            data,
            'PointGeometrical',
            name,
            style
        );
    }
}
