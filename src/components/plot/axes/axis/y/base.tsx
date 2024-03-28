import {
    axisSize_
} from '../../../../../utils_refactor/constants/plot';
import {
    useContext
} from 'react';
import useAxis from '../base';
import {
    numberPower
} from '../../../../../utils_refactor/functions/numberProcessing';
import {
    axesContext
} from '../../Axes';

export default function YAxis(
    {
        visible = true,
        name = 'y'
    }
) {
    const axis = useAxis('y', 0.001, 1, 999, name);
    const {
        size: {
            height: axesHeight,
            width: axesWidth
        },
        ctx: {
            plot: axesCtx
        },
        density,
        padding
    } = useContext(axesContext);
    const spread = axis.state.local.max - axis.state.local.min;
    const scale = axis.state.local.scale + axis.state.delta.scale;
    const dyt = (-axesHeight / spread - scale) * spread;

    function init() {
        const global = { ...axis.state.global },
            delta = { ...axis.state.delta };

        const top = axesHeight * (1 - padding.top),
            bottom = axesHeight * padding.bottom;

        // global.min = Math.min.apply(null,
        //     this.axes.drawings.map(drawing => drawing.global.y.min));
        // global.max = Math.max.apply(null,
        //     this.axes.drawings.map(drawing => drawing.global.y.max));

        global.scale = (bottom - top) / (global.max - global.min);
        global.translate = top - (bottom - top) /
            (global.max - global.min) * global.min;

        axis.setState({
            ...axis.state,
            global,
            local: { ...global },
            delta
        });
    }

    function reScale(ds: number) {}

    function reTranslate(dt: number) {}

    function transformCoordinates() {
        const local = {
            ...axis.state.local
        };

        // TODO: aggregate min and max
        // local.min = Math.min.apply(null,
        //     this.axes.drawings.map(drawing => drawing.local.y.min));
        // local.max =  Math.max.apply(null,
        //     this.axes.drawings.map(drawing => drawing.local.y.max));

        const top = axesHeight * (1 - padding.top),
            bottom = axesHeight * padding.bottom;
        local.scale = (bottom - top) / (local.max - local.min);
        local.translate = top - (bottom - top) /
            (local.max - local.min) * local.min;
        axis.setState({
            ...axis.state,
            local
        });
    }

    function setWindow() {
        const scale = axis.scaleRef.current,
            tooltip = axis.tooltipRef.current;
        if (scale && tooltip) {
            tooltip.addEventListener(
                'wheel', axis.wheelHandler(reScale), { passive: false });
            scale.width = axisSize_.width;
            scale.height = axesHeight;
            tooltip.width = axisSize_.width;
            tooltip.height = axesHeight;
        }
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
            const step = axesHeight / (axis.state.grid.amount + 1) * density;
            for (let index = 0; index < axis.state.grid.amount; ++index) {
                const y = (axis.state.grid.amount - index) * step;
                // AxisBase tick
                ctx.beginPath();
                ctx.moveTo(
                    scaleWidth * (1 - padding.right),
                    y
                );
                ctx.lineTo(
                    scaleWidth * (0.9 - padding.right),
                    y
                );
                ctx.stroke();
                ctx.closePath();
                const value = numberPower(
                    axis.state.local.min + 0.5 * dyt / scale -
                    (axesHeight + dyt - y) / scale,
                    2
                );
                ctx.fillText(
                    value,
                    axesWidth * 0.85,
                    y + 4
                );
                // Grid horizontal line
                axesCtx.beginPath();
                axesCtx.moveTo(0, y);
                axesCtx.lineTo(axesWidth, y);
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
                y * density
            );
            axesCtx.lineTo(
                axesWidth,
                y * density
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
                axis.state.local.min + 0.5 * dyt / scale -
                (axesHeight + dyt - y) / scale, 2
            );
            ctx.fillText(value, axisSize_.width * 0.05, y + 3);
            ctx.restore();
        }
    }

    return visible ? <>
        <canvas
            ref={axis.scaleRef}
            className={'axes y scale'}
            style={{
                width: axisSize_.width,
                height: axesHeight
            }}
        ></canvas>
        <canvas
            ref={axis.tooltipRef}
            className={'axes y tooltip'}
            style={{
                width: axisSize_.width,
                height: axesHeight
            }}
            onMouseMove={axis.mouseMoveHandler(reScale)}
            onMouseOut={axis.mouseOutHandler}
            onMouseDown={axis.mouseDownHandler}
            onMouseUp={axis.mouseUpHandler}
        ></canvas>
    </> : null;
}
