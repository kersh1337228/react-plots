import {
    ObjectTimeSeries,
    PointNumeric
} from '../../../../../../utils/types/plotData';
import Drawing from '../../Drawing';
import ObjectData from './base';

export default class ObjectTimeSeriesData extends ObjectData<
    ObjectTimeSeries
> {
    public constructor(
        drawing: Drawing<any, any>,
        data: ObjectTimeSeries[],
        vField: string,
        minField: string = vField,
        maxField: string = vField
    ) {
        super(drawing, data, vField, minField, maxField);

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
        return [
            at + 0.55,
            this.data[at][this.vField]
        ] as PointNumeric;
    }
}
