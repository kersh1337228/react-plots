import {
    AxesReal
} from '../../Axes';
import NumberRange from '../../../../../../utils_refactor/classes/iterable/NumberRange';
import XAxis from './base';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import {
    numberPower
} from '../../../../../../utils_refactor/functions/numberProcessing';

export default class XAxisNumeric extends XAxis<
    NumberRange
> {
    public constructor(
        axes: AxesReal,
        data: NumberRange,
        visible: boolean = true,
        name: string = 'x',
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
        super(axes, data, visible, 1, name, grid, font);

        const delta = (data.at(-1) as number) - (data.at(0) as number);
        this.delta.min = Math.min(5, delta);
        this.delta.max = Math.min(100, delta);
    }

    public override drawGrid() {
        const ctx = this.axes.ctx.main;
        if (ctx) {
            ctx.save();
            ctx.lineWidth = this.grid.width;
            ctx.strokeStyle = this.grid.color;

            for (let i = 1; i <= this.grid.amount; ++i) {
                const x = i / (this.grid.amount + 1) * this.axes.size.width;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.axes.size.height);
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

            const spread = this.local.max - this.local.min;
            const scale = this.local.scale + this.delta.scale;
            const translate = this.local.translate + this.delta.translate;
            const step = this.axes.size.width / (this.grid.amount + 1) / scale;

            for (let i = 1; i <= this.grid.amount; ++i) {
                const x = i / (this.grid.amount + 1) * this.axes.size.width;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, scaleHeight * 0.1);
                ctx.stroke();
                ctx.closePath();
                ctx.textAlign = 'center';
                ctx.fillText(
                    numberPower(
                        i * step + translate * (
                            spread / this.axes.size.width * (
                                1 - this.axes.padding.left - this.axes.padding.right
                            ) - 1 / scale
                        ) + this.local.min - this.axes.padding.right *
                        this.axes.size.width / scale, 2
                    ),
                    x,
                    scaleHeight * 0.3
                );
            }
            ctx.restore();
        }
    }

    public override drawTooltip(x: number) {
        const scale = this.local.scale + this.delta.scale;
        const translate = this.local.translate + this.delta.translate;

        const i = (this.data as NumberRange).indexOf(
            (x - translate) / scale
        ) as number;
        const xi = this.data.at(i) as number;

        const axesCtx = this.axes.ctx.tooltip;
        if (axesCtx) {
            axesCtx.beginPath();
            axesCtx.moveTo(xi * scale + translate, 0);
            axesCtx.lineTo(xi * scale + translate, this.axes.size.height);
            axesCtx.stroke();
            axesCtx.closePath();
        }

        const ctx = this.ctx.tooltip;
        if (ctx) {
            const {
                width: scaleWidth,
                height: scaleHeight
            } = ctx.canvas as HTMLCanvasElement;

            ctx.clearRect(
                0, 0,
                scaleWidth,
                scaleHeight
            );
            ctx.save();
            ctx.fillStyle = '#323232';
            ctx.fillRect(Math.min(
                this.axes.size.width - 30,
                Math.max(0, xi * scale + translate - 15)
            ), 0, 30, 25);
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            const text = this.data.formatAt(i, '%.2f');
            ctx.textAlign = 'center';
            ctx.fillText(
                text ? text : '',
                Math.min(
                    this.axes.size.width - 15,
                    Math.max(15, xi * scale + translate)
                ),
                scaleHeight * 0.3
            );
            ctx.restore();
        }
    }
}
