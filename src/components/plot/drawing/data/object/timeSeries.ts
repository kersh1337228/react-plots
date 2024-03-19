import {
    ObjectTimeSeries,
    PointGeometrical
} from '../../../../../utils/types/plotData';
import ObjectDataWrapper, { useObjectData } from './base';
import { DataRange } from '../../../../../utils/types/display';
import { useContext } from 'react';
import { AxesContext } from '../../../axes/Axes';

export default class ObjectTimeSeriesDataWrapper extends ObjectDataWrapper<ObjectTimeSeries> {
    public constructor(
        data: ObjectTimeSeries[],
        vfield: string
    ) {
        const ys = Array.from(data, point => point[vfield])
            .filter(y => y !== null) as number[];
        super({
            data, x: {
                min: 0, max: data.length
            }, y: {
                min: Math.min.apply(null, ys),
                max: Math.max.apply(null, ys)
            }
        }, vfield);
    };

    public override localize(range: DataRange): void {
        super.localize(range);
        const ys = Array.from(this.local.data, point => point[this.vfield] as number)
            .filter(volume => volume !== null);
        this.local.y.min = Math.min.apply(null, ys);
        this.local.y.max = Math.max.apply(null, ys);
    };

    public override pointAt(i: number): PointGeometrical {
        return [i + 0.55, this.global.data[i][this.vfield]];
    }

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

export function useObjectTimeSeriesData(
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
        ...objectData,
        pointAt,
        globalize,
        localize
    };
}
