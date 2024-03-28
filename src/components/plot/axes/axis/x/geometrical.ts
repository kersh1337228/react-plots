import {
    useXAxis
} from './base';
import {
    useContext
} from 'react';
import {
    axesContext
} from '../../Axes';

export default function XAxisGeometrical(
    {
        visible = true,
        name = ''
    }
) {
    const {
        axis: {
            x: {
                data
            }
        }
    } = useContext(axesContext);

    const delta = (data.at(-1) as number) - (data.at(0) as number);
    const XAxis = useXAxis(
        visible,
        Math.min(5, delta),
        Math.min(100, delta),
        name
    );

    return XAxis.render();
}
