import { axisSize_ } from '../../../../../utils/constants/plot';
import { useRef, useState } from 'react';
import Axis, { AxisProps } from '../Axis';
import { Callback } from '../../../../../utils/types/callable';

class yAxisState extends Axis {
    public constructor(
        name?: string
    ) {
        super('y', name);
        this.scrollSpeed = 0.001;
        this.delta.min = 1;
        this.delta.max = 999;
    }

    public override reScale(ds: number, callback?: Callback) {
        // TODO: y reScale
        if (callback)
            callback();
    }

    public override reTranslate(dt: number, callback?: Callback) {
        // TODO: y reTranslate
        if (callback)
            callback();
    }
}

function useDescriptor<
    StateT extends Object & {
        setState: React.Dispatch<
            React.SetStateAction<StateT>
        >
    }
>(initialState: StateT) {
    const [state, setState] = useState(initialState);
    state.setState = setState;
    return state;
}

export default function yAxis(props: AxisProps) {
    const state = useDescriptor(new yAxisState());

    const scaleRef = useRef<HTMLCanvasElement>(null);
    const tooltipRef = useRef<HTMLCanvasElement>(null);

    return <>
        <canvas
            ref={scaleRef}
            className={'axes y scale'}
            style={{
                width: axisSize_.width,
                height: props.size
            }}
        ></canvas>
        <canvas
            ref={tooltipRef}
            className={'axes y tooltip'}
            style={{
                width: axisSize_.width,
                height: props.size
            }}
            onMouseMove={state.mouseMoveHandler}
            onMouseOut={state.mouseOutHandler}
            onMouseDown={state.mouseDownHandler}
            onMouseUp={state.mouseUpHandler}
        ></canvas>
    </>
}
