import {
    PlotData,
    PlotDataName,
    PointGeometrical
} from '../../../../utils/types/plotData';
import { plotDataType } from '../../../../utils/functions/plotDataProcessing';
import { DataRange } from '../../../../utils/types/display';
import { DrawingData } from '../base';
import React, { useRef, useState } from 'react';
import NumberRange from '../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils/classes/iterable/DateTimeRange';

// export abstract class DataWrapper<
//     DataT extends PlotData
// > {
//     protected local: DrawingData<DataT>
//     protected readonly type: PlotDataName
//     protected constructor(
//         public readonly global: DrawingData<DataT>
//     ) {
//         this.local = {
//             ...this.global,
//             x: { ...this.global.x },
//             y: { ...this.global.y }
//         };
//         this.type = plotDataType(global.data) as PlotDataName;
//     };
//
//     public localize(
//         range: DataRange
//     ): void {
//         this.local.x.min = range.start * this.global.x.max
//         this.local.x.max = range.end * this.global.x.max
//         this.local.data = this.global.data.slice(
//             Math.floor(this.global.data.length * range.start),
//             Math.ceil(this.global.data.length * range.end)
//         );
//     };
//
//     public abstract globalize(
//         x: number,
//         data: NumberRange | DateTimeRange | null,
//         xt: number,
//         xs: number,
//         density: number | null
//     ): number;
//
//     public abstract pointAt(
//         i: number
//     ): PointGeometrical;
//
//     public abstract showTooltip(
//         globalX: number,
//         name: string
//     ): React.ReactNode;
//
//     public get points(): PointGeometrical[] {
//         return this.local.data.map((_, i) => this.pointAt(i));
//     };
//
//     public get size() {
//         return this.local.data.length;
//     };
// }

export function useData<
    DataT extends PlotData
>(
    global: DrawingData<DataT>,
    type: PlotDataName
) {
    const [local, setLocal] = useState({
        ...global,
        x: { ...global.x },
        y: { ...global.y }
    });

    function localize(range: DataRange) {
        return {
            ...local,
            x: {
                min: range.start * global.x.max,
                max: range.end * global.x.max
            },
            data: global.data.slice(
                Math.floor(global.data.length * range.start),
                Math.ceil(global.data.length * range.end)
            )
        };
    }

    return {
        global,
        local,
        type,
        localize,
        setLocal
    };
}
