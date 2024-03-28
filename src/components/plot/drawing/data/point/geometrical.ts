import {
    PointGeometrical
} from '../../../../../utils_refactor/types/plotData';
import NumberRange from '../../../../../utils_refactor/classes/iterable/NumberRange';
import usePointData from './base';
import {
    useContext
} from 'react';
import {
    axesContext
} from '../../../axes/Axes';

export default function usePointGeometricalData(
    data: PointGeometrical[]
) {
    const xs =  Array.from(data, point => point[0]),
        ys = Array.from(data, point => point[1])
            .filter(y => y !== null) as number[];
    const pointData = usePointData(
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
        'PointGeometrical'
    );

    function pointAt(i: number): PointGeometrical {
        return pointData.global.data[i];
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
            },
            // density,
        } = useContext(axesContext);
        return (data as NumberRange).indexOf(
            (x - transformMatrix.e) / transformMatrix.a) as number;
    }

    return {
        ...pointData,
        pointAt,
        globalize
    };
}
