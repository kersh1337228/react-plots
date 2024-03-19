import { ObjectGeometrical, PointGeometrical } from '../../../../../utils/types/plotData';
import NumberRange from '../../../../../utils/classes/iterable/NumberRange';
import PointDataWrapper, { usePointData } from './base';
import { useObjectData } from '../object/base';
import { useContext } from 'react';
import { AxesContext } from '../../../axes/Axes';

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

export function usePointGeometricalData(
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
        const { axesContext: {
            axes: {
                x: {
                    data,
                    translate,
                    scale
                }
            },
            // density,
        } } = useContext(AxesContext);
        return (data as NumberRange).indexOf(
            (x - translate) / scale) as number;
    }

    return {
        ...pointData,
        pointAt,
        globalize
    };
}
