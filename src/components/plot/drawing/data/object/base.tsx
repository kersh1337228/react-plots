import { ObjectGeometrical, ObjectTimeSeries, PlotDataName } from '../../../../../utils/types/plotData';
import { DataWrapper, useData } from '../base';
import { DrawingData } from '../../base';
import { round } from '../../../../../utils/functions/numberProcessing';
import { useState } from 'react';

export default abstract class ObjectDataWrapper<
    DataT extends ObjectGeometrical | ObjectTimeSeries
> extends DataWrapper<DataT> {
    public constructor(
        global: DrawingData<DataT>,
        protected vfield: string
    ) {
        super(global);
    }

    public override showTooltip(globalX: number, name: string) {
        const obj = this.global.data[globalX];
        return <li key={name} className={'drawingTooltips'}>
            <ul>
                {Object.entries(obj).map(([key, value]) =>
                    <li key={key}>{name}: {round(value as number, 2)}</li>
                )}
            </ul>

        </li>;
    }
}

export function useObjectData<
    DataT extends ObjectGeometrical | ObjectTimeSeries
>(
    global: DrawingData<DataT>,
    vfield: string,
    type: 'ObjectGeometrical' | 'ObjectTimeSeries'
) {
    const data = useData(global, type);

    function showTooltip(
        globalX: number,
        name: string
    ) {
        const obj = global.data[globalX];
        return <li key={name} className={'drawingTooltips'}>
            <ul>
                {Object.entries(obj).map(([key, value]) =>
                    <li key={key}>{name}: {round(value as number, 2)}</li>
                )}
            </ul>

        </li>;
    }

    return {
        ...data,
        vfield,
        showTooltip
    };
}
