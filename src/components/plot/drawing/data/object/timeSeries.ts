import {
    ObjectTimeSeries,
    PointGeometrical
} from '../../../../../utils_refactor/types/plotData';
import useObjectData from './base';
import { DataRange } from '../../../../../utils_refactor/types/display';
import { useContext } from 'react';
import { axesContext } from '../../../axes/Axes';

export default function useObjectTimeSeriesData(
    data: ObjectTimeSeries[],
    vfield: string
) {
    const ys = Array.from(data, point => point[vfield])
        .filter(y => y !== null) as number[];
    const objectData = useObjectData(
        {
            data,
            x: {
                min: 0,
                max: data.length
            },
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        },
        vfield,
        'ObjectTimeSeries'
    );

    function pointAt(i: number): PointGeometrical {
        return [i + 0.55, objectData.global.data[i][objectData.vfield]];
    }

    function localize(range: DataRange) {
        const local = objectData.localize(range);
        const ys = Array.from(
            local.data, point => point[objectData.vfield] as number)
            .filter(volume => volume !== null);
        local.y.min = Math.min.apply(null, ys);
        local.y.max = Math.max.apply(null, ys);
        objectData.setLocal(local);
    }

    function globalize(
        x: number
    ): number {
        const {
            transformMatrix,
            // xAxisData,
            density
        } = useContext(axesContext);
        return Math.floor((x * density - transformMatrix.e) / transformMatrix.a);
    }

    return {
        ...objectData,
        pointAt,
        globalize,
        localize
    };
}
