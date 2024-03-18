import { PlotData } from '../../../../utils/types/plotData';
import { LineStyleT } from './base';
import { plotDataType } from '../../../../utils/functions/plotDataProcessing';

export default function Line(
    {
        data,
        name = '',
        style = { color: '#000000', width: 1 }
    }: {
        data: PlotData[],
        name: string,
        style: LineStyleT
    }
) {
    const type = plotDataType(data);
    switch (type) {
        case 'PointGeometrical':

        case 'PointTimeSeries':

        case 'ObjectGeometrical':

        case 'ObjectTimeSeries':

    }

    return null;
}
