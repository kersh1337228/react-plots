import XAxis from './base';
import {
    AxesReal
} from '../../Axes';
import {
    AxisGrid,
    Font
} from '../../../../../../utils/types/display';
import DateTimeRange from '../../../../../../utils/classes/iterable/DateTimeRange';
import { truncate } from '../../../../../../utils/functions/numberProcessing';
import { delta_ } from '../../../../../../utils/constants/plot';

export default class XAxisTimeSeries extends XAxis<
    DateTimeRange
> {
    public constructor(
        axes: AxesReal,
        data: DateTimeRange,
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
        const spread = data.length;
        super(
            axes,
            data,
            {
                min: delta_.min < spread ? delta_.min : spread,
                max: delta_.max < spread ? delta_.max : spread
            },
            visible,
            0.01,
            name,
            grid,
            font
        );
    }

    public override drawGrid() {
        const ctx = this.axes.ctx.grid as CanvasRenderingContext2D;
        ctx.save();
        ctx.lineWidth = this.grid.width;
        ctx.strokeStyle = this.grid.color;

        const scale = this.local.scale + this.delta.scale;
        const translate = this.local.translate + this.delta.translate;
        const step = this.axes.size.width /
            (this.grid.amount + 1) * this.axes.density;

        for (let i = 1; i <= this.grid.amount; ++i) {
            const t = (Math.floor(
                (i * step - translate) / scale
            ) + 0.55) * scale + translate;

            ctx.beginPath();
            ctx.moveTo(t, 0);
            ctx.lineTo(t, this.axes.size.height);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
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
            const translate = this.local.translate + this.delta.translate;
            const step = this.axes.size.width /
                (this.grid.amount + 1) * this.axes.density;

            for (let i = 1; i <= this.grid.amount; ++i) {
                const t = Math.floor((i * step - translate) / scale),
                    globalX = (t + 0.55) * scale + translate;

                ctx.beginPath();
                ctx.moveTo(globalX, 0);
                ctx.lineTo(
                    globalX,
                    scaleHeight * 0.1
                );
                ctx.stroke();
                ctx.closePath();

                const text = this.data.formatAt(t);
                ctx.textAlign = 'center';
                ctx.fillText(
                    text ? text : '',
                    globalX,
                    scaleHeight * 0.3
                );
            }
            ctx.restore();
        }
    }

    public override drawTooltip(x: number) {
        const scale = this.local.scale + this.delta.scale;
        const translate = this.local.translate + this.delta.translate;

        const t = Math.floor((x * this.axes.density - translate) / scale),
            globalX = (t + 0.55) * scale + translate;

        const axesCtx = this.axes.ctx.tooltip as CanvasRenderingContext2D;
        axesCtx.beginPath();
        axesCtx.moveTo(globalX, 0);
        axesCtx.lineTo(globalX, this.axes.size.height);
        axesCtx.stroke();
        axesCtx.closePath();

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
                    globalX - 30,
                    0,
                    this.axes.size.width - 60
                ),
                0,
                60,
                25
            );

            const text = this.data.formatAt(t);
            ctx.textAlign = 'center';
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
                text ? text : '',
                truncate(
                    globalX,
                    30,
                    this.axes.size.width - 30
                ),
                scaleHeight * 0.3
            );

            ctx.restore();
        }
    }
}
