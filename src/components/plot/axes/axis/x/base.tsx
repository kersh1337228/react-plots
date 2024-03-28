import useAxis from '../base';
import {
    useContext,
    useState
} from 'react';
import {
    axesContext
} from '../../Axes';
import {
    truncate
} from '../../../../../utils_refactor/functions/numberProcessing';
import {
    axisSize_
} from '../../../../../utils_refactor/constants/plot';
import {
    AxisContext
} from '../base';
import NumberRange from '../../../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../../../utils_refactor/classes/iterable/DateTimeRange';

export declare interface XAxisContext extends AxisContext {
    data: NumberRange | DateTimeRange
}

export function useXAxis(
    visible = true,
    deltaMin: number = 5,
    deltaMax: number = 500,
    name?: string
) {
    const axis = useAxis('x', 1, deltaMin, deltaMax, name);

    const {
        axis: {
            x: {
                data
            }
        },
        dataRange,
        size: {
            width: axesWidth
        },
        padding
    } = useContext(axesContext);

    const [local, setLocal] = useState(data);

    function init() {
        const global = { ...axis.state.global },
            delta = { ...axis.state.delta };

        const left = axesWidth * padding.left,
            right = axesWidth * (1 - padding.right);

        // global.min = Math.min.apply(null,
        //     this.axes.drawings.map(drawing => drawing.global.x.min));
        // global.max = Math.max.apply(null,
        //     this.axes.drawings.map(drawing => drawing.global.x.max));

        global.scale = (right - left) / (global.max - global.min);
        global.translate = left - (right - left) /
            (global.max - global.min) * global.min;

        const local = { ...global };
        if (global.max > delta.max) {
            local.min = global.max - delta.max
            delta.scale = (right - left) * (
                1 / delta.max - 1 / (global.max - global.min));
            delta.translate = (right - left) * (global.min /
                (global.max - global.min) - local.min / delta.max);
        }

        axis.setState({
            ...axis.state,
            global,
            local,
            delta
        });
    }

    function reScale(ds: number) {
        const global = { ...axis.state.global },
            local = { ...axis.state.local },
            delta = { ...axis.state.delta };

        const left = axesWidth * padding.left,
            right = axesWidth * (1 - padding.right);

        delta.scale = truncate(
            delta.scale + ds,
            (right - left) * (
                1 / delta.max - 1 / (global.max - global.min)),
            (right - left) * (
                1 / delta.min - 1 / (global.max - global.min))
        );
        // Scale
        local.min = truncate(
            local.max - 1 / (
                1 / (global.max - global.min) + delta.scale / (right - left)),
            global.min,
            global.max - delta.min
        );
        // Translate
        const dt = left - local.min * (local.scale + delta.scale)
            - (local.translate + delta.translate);
        delta.translate += dt
        const multiplier = (right - left) / (
            right - left + delta.scale * (global.max - global.min));
        const offset = multiplier * delta.translate / global.scale;
        local.max = truncate(
            multiplier * global.max - offset,
            global.min + delta.min,
            global.max
        );
        local.min = truncate(
            multiplier * global.min - offset,
            global.min,
            global.max - delta.min
        );
        axis.setState({
            ...axis.state,
            global,
            local,
            delta
        });
        // TODO: Applying changes
        // await this.axes.coordinatesTransform({
        //     start: this.metadata.local.min / this.metadata.global.max,
        //     end: this.metadata.local.max / this.metadata.global.max,
        // }, callback)
    }

    function reTranslate(dt: number) {
        const global = { ...axis.state.global },
            local = { ...axis.state.local },
            delta = { ...axis.state.delta };

        const left = axesWidth * padding.left,
            right = axesWidth * (1 - padding.right);

        delta.translate += dt
        const multiplier = (right - left) / (
            right - left + delta.scale * (global.max - global.min));
        let offset = multiplier * delta.translate / global.scale;

        delta.translate -= (
            Math.min(0, global.max * (1 - multiplier) + offset)
            + Math.max(0, global.min * (1 - multiplier) + offset)
        ) * (local.scale + delta.scale);

        offset = multiplier * delta.translate / global.scale;
        local.max = truncate(
            multiplier * global.max - offset,
            global.min + delta.min,
            global.max
        );
        local.min = truncate(
            multiplier * global.min - offset,
            global.min,
            global.max - delta.min
        );
        axis.setState({
            ...axis.state,
            global,
            local,
            delta
        });
        // TODO: apply transform
        // await this.axes.coordinatesTransform({
        //     start: this.metadata.local.min / this.metadata.global.max,
        //     end: this.metadata.local.max / this.metadata.global.max,
        // }, callback)
    }

    function transformCoordinates(){
        setLocal(data.slice(
            Math.floor(data.length * dataRange.start),
            Math.ceil(data.length * dataRange.end)
        ));
    }

    function setWindow() {
        const scale = axis.scaleRef.current,
            tooltip = axis.tooltipRef.current;
        if (scale && tooltip) {
            tooltip.addEventListener(
                'wheel', axis.wheelHandler(reScale), { passive: false });
            scale.width = axesWidth;
            scale.height = axisSize_.height;
            tooltip.width = axesWidth;
            tooltip.height = axisSize_.height;
        }
    }

    function render() {
        return visible ? <>
            <canvas
                ref={axis.scaleRef}
                className={'axes x scale'}
                style={{
                    width: axesWidth,
                    height: axisSize_.height
                }}
            ></canvas>
            <canvas
                ref={axis.tooltipRef}
                className={'axes x tooltip'}
                style={{
                    width: axesWidth,
                    height: axisSize_.height
                }}
                onMouseMove={axis.mouseMoveHandler(reScale)}
                onMouseOut={axis.mouseOutHandler}
                onMouseDown={axis.mouseDownHandler}
                onMouseUp={axis.mouseUpHandler}
            ></canvas>
        </> : null;
    }

    return {
        ...axis,
        local,
        init,
        reScale,
        reTranslate,
        transformCoordinates,
        setWindow,
        render
    }
}
