import { ObjectTimeSeries, PointGeometrical, PointTimeSeries } from '../../../../../utils/types/plotData';
import { DataRange } from '../../../../../utils/types/display';
import PointDataWrapper, { usePointData } from './base';
import { useObjectData } from '../object/base';
import { useContext } from 'react';
import { AxesContext } from '../../../axes/Axes';

export default class PointTimeSeriesDataWrapper extends PointDataWrapper<PointTimeSeries> {
    public constructor(
        data: PointTimeSeries[]
    ) {
        const ys = Array.from(data, point => point[1])
            .filter(y => y !== null) as number[];
        super({
            data,
            x: {
                min: 0,
                max: data.length
            },
            y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        });
    };

    public override localize(range: DataRange): void {
        super.localize(range);
        const ys = Array.from(this.local.data, point => point[1] as number)
            .filter(volume => volume !== null);
        this.local.y.min = Math.min.apply(null, ys);
        this.local.y.max = Math.max.apply(null, ys);
    };

    public override pointAt(i: number): PointGeometrical {
        return [i + 0.55, this.global.data[i][1]];
    };

    public override globalize(
        x: number,
        data: null,
        xt: number,
        xs: number,
        density: number
    ): number {
        return Math.floor((x * density - xt) / xs);
    };
}

export function usePointTimeSeriesData(
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
        const { axesContext: {
            axes: {
                x: {
                    // data,
                    translate,
                    scale
                }
            },
            density,
        } } = useContext(AxesContext);
        return Math.floor((x * density - translate) / scale);
    }

    return {
        ...pointData,
        pointAt,
        globalize,
        localize
    };
}
