import { PointGeometrical } from '../../../../../utils/types/plotData';
import NumberRange from '../../../../../utils/classes/iterable/NumberRange';
import PointDataWrapper from './base';

export default class PointGeometricalDataWrapper extends PointDataWrapper<PointGeometrical> {
    public constructor(
        data: PointGeometrical[]
    ) {
        const xs =  Array.from(data, point => point[0]),
            ys = Array.from(data, point => point[1])
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
        });
    };

    public override pointAt(i: number) {
        return this.global.data[i];
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
