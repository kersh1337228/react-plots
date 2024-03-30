import {
    axisSize_
} from '../../../../../utils_refactor/constants/plot';
import {
    useContext,
    useEffect
} from 'react';
import useAxis, { AxisContext } from '../base';
import {
    numberPower
} from '../../../../../utils_refactor/functions/numberProcessing';
import {
    axesContext
} from '../../Axes';
import {
    AxisData,
    Padding,
    Size
} from '../../../../../utils_refactor/types/display';
import {
    DrawingContext,
    DrawingData
} from '../../../drawing/Drawing';

export function initYAxisContext(
    size: Size,
    padding: Padding,
    drawings: { [name: string]: DrawingContext }
): AxisContext {
    const global = {
        min: 0,
        max: 0,
        scale: 1,
        translate: 0
    };
    const delta = {
        min: 5,
        max: 500,
        scale: 0,
        translate: 0
    };

    const top = size.height * (1 - padding.top),
        bottom = size.height * padding.bottom;

    global.min = Math.min.apply(
        null, Object.values(drawings).map(
            drawing => drawing.local.y.min));
    global.max = Math.min.apply(
        null, Object.values(drawings).map(
            drawing => drawing.local.y.max));

    global.scale = (bottom - top) / (global.max - global.min);
    global.translate = top - (bottom - top) /
        (global.max - global.min) * global.min;

    // @ts-ignore
    return {
        global,
        local: { ...global },
        delta
    };
}

export default function YAxis(
    {
        visible = true,
        name = 'y'
    }
) {
    const axis = useAxis('y', 0.001, 1, 999, name);

    const context = useContext(axesContext);
    const self = context.axis.y;
    const axesCtx = context.ctx.plot;

    const spread = self.local.max - self.local.min;
    const scale = self.local.scale + self.delta.scale;
    const dyt = (-context.size.height / spread - scale) * spread;

    function reScale(ds: number) {
        return {
            local: self.local,
            delta: self.delta
        };
    }

    function reTranslate(dt: number) {
        return {
            local: self.local,
            delta: self.delta
        };
    }

    function transform(drawingLocal: DrawingData[]): AxisData {
        const local = { ...self.local };

        local.min = Math.min.apply(null, drawingLocal.map(l => l.y.min));
        local.max = Math.max.apply(null, drawingLocal.map(l => l.y.max));

        const top = context.size.height * (1 - context.padding.top),
            bottom = context.size.height * context.padding.bottom;

        local.scale = (bottom - top) / (local.max - local.min);
        local.translate = top - (bottom - top) /
            (local.max - local.min) * local.min;

        return local;
    }

    async function drawScale() {
        const ctx = axis.state.ctx.scale;
        if (axesCtx && ctx) {
            axesCtx.save();
            axesCtx.lineWidth = axis.state.grid.width;
            axesCtx.strokeStyle = axis.state.grid.color;
            ctx.save();
            const {
                width: scaleWidth,
                height: scaleHeight
            } = axis.scaleRef.current as HTMLCanvasElement;
            ctx.clearRect(
                0, 0,
                scaleWidth,
                scaleHeight
            );
            ctx.font = `${axis.state.font.size}px ${axis.state.font.family}`;
            ctx.textAlign = 'right';
            const step = context.size.height / (axis.state.grid.amount + 1) * context.density;
            for (let index = 0; index < axis.state.grid.amount; ++index) {
                const y = (axis.state.grid.amount - index) * step;
                // AxisBase tick
                ctx.beginPath();
                ctx.moveTo(
                    scaleWidth * (1 - context.padding.right),
                    y
                );
                ctx.lineTo(
                    scaleWidth * (0.9 - context.padding.right),
                    y
                );
                ctx.stroke();
                ctx.closePath();
                const value = numberPower(
                    self.local.min + 0.5 * dyt / scale -
                    (context.size.height + dyt - y) / scale,
                    2
                );
                ctx.fillText(
                    value,
                    context.size.width * 0.85,
                    y + 4
                );
                // Grid horizontal line
                axesCtx.beginPath();
                axesCtx.moveTo(0, y);
                axesCtx.lineTo(context.size.width, y);
                axesCtx.stroke();
                axesCtx.closePath();
            }
            ctx.restore();
            axesCtx.restore();
        }
    }

    async function drawTooltip(y: number) {
        if (axesCtx) { // Drawing horizontal line
            axesCtx.beginPath();
            axesCtx.moveTo(
                0,
                y * context.density
            );
            axesCtx.lineTo(
                context.size.width,
                y * context.density
            );
            axesCtx.stroke();
            axesCtx.closePath();
        }

        const ctx = axis.state.ctx.scale;
        if (ctx) { // Drawing tooltip
            const {
                width: tooltipWidth,
                height: tooltipHeight
            } = axis.tooltipRef.current as HTMLCanvasElement;
            ctx.clearRect(
                0, 0,
                tooltipWidth,
                tooltipHeight
            );
            ctx.save();
            ctx.fillStyle = '#323232';
            ctx.fillRect(0, y - 12.5, axisSize_.width, 25);
            ctx.font = `${axis.state.font.size}px ${axis.state.font.family}`;
            ctx.fillStyle = '#ffffff';
            // Value tooltip
            const value = numberPower(
                self.local.min + 0.5 * dyt / scale -
                (context.size.height + dyt - y) / scale, 2
            );
            ctx.fillText(value, axisSize_.width * 0.05, y + 3);
            ctx.restore();
        }
    }

    useEffect(() => {
        axis.tooltipRef.current?.addEventListener(
            'wheel', axis.wheelHandler(reScale), { passive: false });
        context.dispatch((context) => {
            context.axis.y = {
                ...context.axis.y,
                ...axis,
                reScale,
                reTranslate,
                transform,
            }
            return context;
        });
    }, []);

    return visible ? <>
        <canvas
            ref={axis.scaleRef}
            className={'axes y scale'}
            style={{
                width: axisSize_.width,
                height: context.size.height
            }}
            width={axisSize_.width}
            height={context.size.height}
        ></canvas>
        <canvas
            ref={axis.tooltipRef}
            className={'axes y tooltip'}
            style={{
                width: axisSize_.width,
                height: context.size.height
            }}
            width={axisSize_.width}
            height={context.size.height}
            onMouseMove={axis.mouseMoveHandler(reScale)}
            onMouseOut={axis.mouseOutHandler}
            onMouseDown={axis.mouseDownHandler}
            onMouseUp={axis.mouseUpHandler}
        ></canvas>
    </> : null;
}
