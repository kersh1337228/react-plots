import {
    AxesReal
} from '../../Axes';
import NumberRange from '../../../../../../utils/classes/iterable/NumberRange';
import XAxis from './base';
import {
    AxisGrid,
    Font
} from '../../../../../../utils/types/display';
import {
    numberPower, truncate
} from '../../../../../../utils/functions/numberProcessing';

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
        super(axes, data, visible, 0.01, name, grid, font);

        const spread = (data.at(-1) as number) - (data.at(0) as number);
        this.delta.min = data.freq * 5 < spread ? data.freq * 5 : spread;
        this.delta.max = data.freq * 500 < spread ? data.freq * 500 : spread;
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

            const scale = this.local.scale + this.delta.scale;
            const gridGap = this.axes.size.width / (this.grid.amount + 1);

            const dx = (
                this.local.translate + this.delta.translate
            ) * (
                (this.local.max - this.local.min) / this.axes.size.width * (
                    1 - this.axes.padding.left - this.axes.padding.right
                ) - 1 / scale
            ) + this.local.min - this.axes.padding.right * this.axes.size.width / scale;

            for (let i = 1; i <= this.grid.amount; ++i) {
                const x = i * gridGap;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, scaleHeight * 0.1);
                ctx.stroke();
                ctx.closePath();

                ctx.textAlign = 'center';
                ctx.fillText(
                    numberPower(x / scale + dx, 2),
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
        ) as number,
            globalX = (this.data.at(i) as number) * scale + translate;

        const axesCtx = this.axes.ctx.tooltip;
        if (axesCtx) {
            axesCtx.beginPath();
            axesCtx.moveTo(globalX, 0);
            axesCtx.lineTo(globalX, this.axes.size.height);
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


            ctx.fillRect(
                truncate(
                    globalX - 15,
                    0,
                    this.axes.size.width - 30
                ),
                0,
                30,
                25
            );

            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            const text = this.data.formatAt(i, '%.2f');
            ctx.textAlign = 'center';
            ctx.fillText(
                text !== undefined ? text : '',
                truncate(
                    globalX,
                    15,
                    this.axes.size.width - 15
                ),
                scaleHeight * 0.3
            );

            ctx.restore();
        }
    }
}
