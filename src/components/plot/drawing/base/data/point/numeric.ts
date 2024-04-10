import {
    PointNumeric
} from '../../../../../../utils/types/plotData';
import NumberRange from '../../../../../../utils/classes/iterable/NumberRange';
import Drawing from '../../Drawing';
import PointData from './base';

export default class PointNumericData extends PointData<
    PointNumeric
> {
    public constructor(
        drawing: Drawing<any, any>,
        data: PointNumeric[]
    ) {
        super(drawing, data);

        const xs = (data as PointNumeric[]).map(point => point[0]);
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
        return this.data[at];
    }
}
