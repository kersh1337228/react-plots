import {
    ObjectGeometrical,
    PointGeometrical
} from '../../../../../utils_refactor/types/plotData';
import useObjectData from './base';
import NumberRange from '../../../../../utils_refactor/classes/iterable/NumberRange';
import {
    useContext
} from 'react';
import {
    axesContext
} from '../../../axes/Axes';

export default function useObjectGeometricalData(
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
        const {
            transformMatrix,
            axis: {
                x: {
                    data
                }
            }
            // density,
        } = useContext(axesContext);
        return (data as NumberRange).indexOf(
            (x - transformMatrix.e) / transformMatrix.a) as number;
    }

    return {
        ...objectData,
        pointAt,
        globalize
    };
}
