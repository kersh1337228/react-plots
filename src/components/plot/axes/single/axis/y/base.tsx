import {
    axisSize_
} from '../../../../../../utils_refactor/constants/plot';
import React, {
    createRef,
    useEffect
} from 'react';
import {
    numberPower
} from '../../../../../../utils_refactor/functions/numberProcessing';
import {
    AxesReal
} from '../../Axes';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import Axis from '../base';

export default class YAxis extends Axis {
    public constructor(
        axes: AxesReal,
        visible: boolean = true,
        name: string = 'y',
        grid: AxisGrid = {
            amount: 5,
            color: '#d9d9d9',
            width: 1
        },
        font: Font = {
            family: 'Serif',
            size: 10
        }
    ) {
        super(axes, 'y', visible, 0.001, name, grid, font);
        const top = axes.size.height * (1 - axes.padding.top),
            bottom = axes.size.height * axes.padding.bottom;

        this.global.min = Math.min.apply(
            null, axes.drawings.map(
                drawing => drawing.local.y.min));
        this.global.max = Math.min.apply(
            null, axes.drawings.map(
                drawing => drawing.local.y.max));

        this.global.scale = (bottom - top) / (this.global.max - this.global.min);
        this.global.translate = top - (bottom - top) /
            (this.global.max - this.global.min) * this.global.min;

        this.local = { ...this.global };
    };

    public override reScale(_: number) {
        // TODO: y rescale
    };

    public override reTranslate(_: number) {
        // TODO: y retranslate
    };

    public transform() {
        this.local.min = Math.min.apply(null, this.axes.drawings
            .map(drawing => drawing.local.y.min));
        this.local.max = Math.min.apply(null, this.axes.drawings
            .map(drawing => drawing.local.y.max));

        const top = this.axes.size.height * (1 - this.axes.padding.top),
            bottom = this.axes.size.height * this.axes.padding.bottom;

        this.local.scale = (bottom - top) / (this.local.max - this.local.min);
        this.local.translate = top - (bottom - top) /
            (this.local.max - this.local.min) * this.local.min;
    };

    public override drawGrid() {
        const ctx = this.axes.ctx.main;
        if (ctx) {
            ctx.save();
            ctx.lineWidth = this.grid.width;
            ctx.strokeStyle = this.grid.color;

            const step = this.axes.size.height /
                (this.grid.amount + 1) * this.axes.density;
            for (let index = 0; index < this.grid.amount; ++index) {
                const y = (this.grid.amount - index) * step;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.axes.size.width, y);
                ctx.stroke();
                ctx.closePath();
            }
            ctx.restore();
        }
    }

    public override drawTicks() {
        const ctx = this.ctx.main;
        if (ctx) {
            ctx.save();
            const {
                width: scaleWidth,
                height: scaleHeight
            } = ctx.canvas as HTMLCanvasElement;
            ctx.clearRect(
                0, 0,
                scaleWidth,
                scaleHeight
            );
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.textAlign = 'right';

            const spread = this.local.max - this.local.min;
            const scale = this.local.scale + this.delta.scale;
            const dyt = (-this.axes.size.height / spread - scale) * spread;
            const step = this.axes.size.height / (this.grid.amount + 1) * this.axes.density;
            for (let index = 0; index < this.grid.amount; ++index) {
                const y = (this.grid.amount - index) * step;

                ctx.beginPath();
                ctx.moveTo(
                    scaleWidth * (1 - this.axes.padding.right),
                    y
                );
                ctx.lineTo(
                    scaleWidth * (0.9 - this.axes.padding.right),
                    y
                );
                ctx.stroke();
                ctx.closePath();
                const value = numberPower(
                    this.local.min + 0.5 * dyt / scale -
                    (this.axes.size.height + dyt - y) / scale,
                    2
                );
                ctx.fillText(
                    value,
                    axisSize_.width * 0.85,
                    y + 4
                );
            }
            ctx.restore();
        }
    };

    public override drawTooltip(y: number) {
        const axesCtx = this.axes.ctx.tooltip;
        if (axesCtx) {
            axesCtx.beginPath();
            axesCtx.moveTo(
                0,
                y * this.axes.density
            );
            axesCtx.lineTo(
                this.axes.size.width,
                y * this.axes.density
            );
            axesCtx.stroke();
            axesCtx.closePath();
        }

        const ctx = this.ctx.tooltip;
        if (ctx) { // Drawing tooltip
            const {
                width: tooltipWidth,
                height: tooltipHeight
            } = ctx.canvas as HTMLCanvasElement;
            ctx.clearRect(
                0, 0,
                tooltipWidth,
                tooltipHeight
            );
            ctx.save();
            ctx.fillStyle = '#323232';
            ctx.fillRect(0, y - 12.5, axisSize_.width, 25);
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            // Value tooltip
            const spread = this.local.max - this.local.min;
            const scale = this.local.scale + this.delta.scale;
            const dyt = (-this.axes.size.height / spread - scale) * spread;
            const value = numberPower(
                this.local.min + 0.5 * dyt / scale -
                (this.axes.size.height + dyt - y) / scale, 2
            );
            ctx.fillText(value, axisSize_.width * 0.05, y + 3);
            ctx.restore();
        }
    };

    public override render() {
        const mainRef = createRef<HTMLCanvasElement>(),
            tooltipRef = createRef<HTMLCanvasElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.wheelHandler, { passive: false });

            this.ctx = {
                main: mainRef.current?.getContext('2d'),
                tooltip: tooltipRef.current?.getContext('2d')
            };
        }, []);

        return this.visible ? <>
            <canvas
                ref={mainRef}
                className={'axes y scale'}
                style={{
                    width: axisSize_.width,
                    height: this.axes.size.height
                }}
                width={axisSize_.width}
                height={this.axes.size.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes y tooltip'}
                style={{
                    width: axisSize_.width,
                    height: this.axes.size.height
                }}
                width={axisSize_.width}
                height={this.axes.size.height}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null;
    };
}
