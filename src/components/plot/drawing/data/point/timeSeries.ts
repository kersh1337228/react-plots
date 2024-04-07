import {
    PointNumeric,
    PointTimeSeries
} from '../../../../../utils_refactor/types/plotData';
import Drawing from '../../Drawing';
import PointData from './base';

export default class PointTimeSeriesData extends PointData<
    PointTimeSeries
> {
    public constructor(
        drawing: Drawing<any, any>,
        data: PointTimeSeries[]
    ) {
        super(drawing, data);

        this.global.x = {
            min: 0,
            max: data.length
        };

        this.local = { ...this.global };
    }

    public override globalize(
        localX: number
    ) {
        const {
            transformMatrix,
            density
        } = this.drawing.axes;
        return Math.floor((
            localX * density - transformMatrix.e
        ) / transformMatrix.a);
    }

    public override point(
        at: number
    ) {
        return [at + 0.55, this.data[at][1]] as PointNumeric;
    }
}
