import {
    ObjectNumeric,
    PointNumeric
} from '../../../../../utils_refactor/types/plotData';
import NumberRange from '../../../../../utils_refactor/classes/iterable/NumberRange';
import Drawing from '../../Drawing';
import PointData from './base';

export default class ObjectNumericData extends PointData<
    ObjectNumeric
> {
    public constructor(
        drawing: Drawing<any, any>,
        data: ObjectNumeric[],
        vfield: string
    ) {
        super(drawing, data, vfield);

        const xs = (data as ObjectNumeric[]).map(point => point.timestamp);
        this.global.x = {
            min: Math.min.apply(null, xs),
            max: Math.max.apply(null, xs)
        };

        this.local = { ...this.global };
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
            point[this.vfield as string]
        ] as PointNumeric;
    }
}
