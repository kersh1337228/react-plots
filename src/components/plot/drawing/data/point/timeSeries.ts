import {
    PointGeometrical,
    PointTimeSeries
} from '../../../../../utils_refactor/types/plotData';
import { DataRange } from '../../../../../utils_refactor/types/display';
import usePointData from './base';
import { useContext } from 'react';
import { axesContext } from '../../../axes/Axes';

export default function usePointTimeSeriesData(
    data: PointTimeSeries[]
) {
    const ys = Array.from(data, point => point[1])
        .filter(y => y !== null) as number[];
    const pointData = usePointData(
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
        'PointTimeSeries'
    );

    function pointAt(i: number): PointGeometrical {
        return [i + 0.55, pointData.global.data[i][1]];
    }

    function localize(range: DataRange) {
        const local = pointData.localize(range);
        const ys = Array.from(local.data, point => point[1] as number)
            .filter(volume => volume !== null);
        local.y.min = Math.min.apply(null, ys);
        local.y.max = Math.max.apply(null, ys);
        pointData.setLocal(local);
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
        ...pointData,
        pointAt,
        globalize,
        localize
    };
}
