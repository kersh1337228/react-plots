import { ObjectGeometrical, PointGeometrical } from '../../../../../utils/types/plotData';
import ObjectDataWrapper, { useObjectData } from './base';
import NumberRange from '../../../../../utils/classes/iterable/NumberRange';
import { useContext } from 'react';
import { AxesContext } from '../../../axes/Axes';

// export default class ObjectGeometricalDataWrapper extends ObjectDataWrapper<ObjectGeometrical> {
//     public constructor(
//         data: ObjectGeometrical[],
//         vfield: string
//     ) {
//         const xs = Array.from(data, point => point.timestamp);
//         const ys = Array.from(data, point => point[vfield])
//             .filter(y => y !== null) as number[];
//         super({
//             data,
//             x: {
//                 min: Math.min.apply(null, xs),
//                 max: Math.max.apply(null, xs)
//             },
//             y: {
//                 min: Math.min.apply(null, ys),
//                 max: Math.max.apply(null, ys)
//             }
//         }, vfield);
//     };
//
//     public override pointAt(i: number): PointGeometrical {
//         const data = this.global.data[i]
//         return [data.timestamp, data[this.vfield]]
//     };
//
//     public override globalize(
//         x: number,
//         data: NumberRange,
//         xt: number,
//         xs: number,
//         density: null
//     ): number {
//         return data.indexOf((x - xt) / xs) as number;
//     };
// }

export function useObjectGeometricalData(
    data: ObjectGeometrical[],
    vfield: string
) {
    const xs = Array.from(data, point => point.timestamp);
    const ys = Array.from(data, point => point[vfield])
        .filter(y => y !== null) as number[];
    const objectData = useObjectData(
        {
            data,
            x: {
                min: Math.min.apply(null, xs),
                max: Math.max.apply(null, xs)
            },
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        },
        vfield,
        'ObjectGeometrical'
    );

    function pointAt(i: number): PointGeometrical {
        const data = objectData.global.data[i];
        return [data.timestamp, data[vfield]];
    }

    function globalize(
        x: number
    ): number {
        const { axesContext: {
            transformMatrix,
            xAxisData,
            // density,
        } } = useContext(AxesContext);
        return (xAxisData as NumberRange).indexOf(
            (x - transformMatrix.e) / transformMatrix.a) as number;
    }

    return {
        ...objectData,
        pointAt,
        globalize
    };
}
