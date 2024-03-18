import { LineBase } from '../base';
import { PointTimeSeries } from '../../../../../utils/types/plotData';
import { LineStyle } from '../../../../plot_refactor/drawings/Line/LineBase';

export default class LinePointTimeSeries extends LineBase<PointTimeSeries> {
    public constructor(
        data: PointTimeSeries[],
        name: string,
        style?: LineStyle
    ) {
        super(
            data,
            'PointTimeSeries',
            name,
            style
        );
    }
}
