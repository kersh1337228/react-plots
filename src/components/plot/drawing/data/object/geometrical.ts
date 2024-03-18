import { ObjectGeometrical, PointGeometrical } from '../../../../../utils/types/plotData';
import ObjectDataWrapper from './base';
import NumberRange from '../../../../../utils/classes/iterable/NumberRange';

export default class ObjectGeometricalDataWrapper extends ObjectDataWrapper<ObjectGeometrical> {
    public constructor(
        data: ObjectGeometrical[],
        vfield: string
    ) {
        const xs = Array.from(data, point => point.timestamp);
        const ys = Array.from(data, point => point[vfield])
            .filter(y => y !== null) as number[];
        super({
            data,
            x: {
                min: Math.min.apply(null, xs),
                max: Math.max.apply(null, xs)
            },
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        }, vfield);
    };

    public override pointAt(i: number): PointGeometrical {
        const data = this.global.data[i]
        return [data.timestamp, data[this.vfield]]
    };

    public override globalize(
        x: number,
        data: NumberRange,
        xt: number,
        xs: number,
        density: null
    ): number {
        return data.indexOf((x - xt) / xs) as number;
    };
}
