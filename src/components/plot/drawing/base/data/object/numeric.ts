import {
    ObjectNumeric,
    PointNumeric
} from '../../../../../../utils/types/plotData';
import NumberRange from '../../../../../../utils/classes/iterable/NumberRange';
import Drawing from '../../Drawing';
import PointData from './base';

export default class ObjectNumericData extends PointData<
    ObjectNumeric
> {
    public constructor(
        drawing: Drawing<any, any>,
        data: ObjectNumeric[],
        vField: string,
        minField: string = vField,
        maxField: string = vField
    ) {
        super(drawing, data, vField, minField, maxField);

        const xs = (data as ObjectNumeric[]).map(point => point.timestamp);
        this.global.x = {
            min: Math.min.apply(null, xs),
            max: Math.max.apply(null, xs)
        };

        this.local = structuredClone(this.global);
    }

    public override globalize(
        localX: number
    ) {
        const {
            transformMatrix,
            x: {
                data: xAxisData
            }
        } = this.drawing.axes;
        return (xAxisData as NumberRange).indexOf((
            localX - transformMatrix.e
        ) / transformMatrix.a) as number;
    }

    public override point(
        at: number
    ) {
        const point = this.data[at] as ObjectNumeric;
        return [
            point.timestamp,
            point[this.vField as string]
        ] as PointNumeric;
    }
}
