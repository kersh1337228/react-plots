import XAxis from './base';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import {
    AxesGroupReal
} from '../../AxesGroup';
import DateTimeRange from '../../../../../../utils_refactor/classes/iterable/DateTimeRange';

export default class XAxisTimeSeries extends XAxis {
    public constructor(
        axes: AxesGroupReal,
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
        super(axes, visible, 0.01, name, grid, font);
    };

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

            const axes = this.axes.axes[0],
                axis = axes.axis.x;
            const scale = axis.local.scale + axis.delta.scale;
            const translate = axis.local.translate + axis.delta.translate;
            const step = this.axes.size.width /
                (this.grid.amount + 1) * axes.density;

            for (let i = 1; i <= this.grid.amount; ++i) {
                const t = Math.floor((i * step - translate) / scale);

                ctx.beginPath();
                ctx.moveTo((t + 0.55) * scale + translate, 0);
                ctx.lineTo(
                    (t + 0.55) * scale + translate,
                    scaleHeight * 0.1
                );
                ctx.stroke();
                ctx.closePath();
                const text = (axis.data as DateTimeRange).formatAt(t, '%Y-%m-%d');
                ctx.textAlign = 'center';
                ctx.fillText(
                    text ? text : '',
                    (t + 0.55) * scale + translate,
                    scaleHeight * 0.3
                );
            }
            ctx.restore();
        }
    };

    public override drawTooltip(x: number) {
        const axes = this.axes.axes[0],
            axis = axes.axis.x;
        const scale = axis.local.scale + axis.delta.scale;
        const translate = axis.local.translate + axis.delta.translate;

        const t = Math.floor((
            x * axes.density - translate
        ) / scale);

        // const axesCtx = this.axes.ctx;
        // if (axesCtx) {
        //     axesCtx.beginPath();
        //     axesCtx.moveTo((t + 0.55) * scale + translate, 0);
        //     axesCtx.lineTo((t + 0.55) * scale + translate, this.axes.size.height);
        //     axesCtx.stroke();
        //     axesCtx.closePath();
        // }

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
                this.axes.size.width - 60,
                Math.max(0, (t + 0.55) * scale + translate - 30)
            ), 0, 60, 25);
            const text = axis.data.formatAt(t, '%Y-%m-%d');
            ctx.textAlign = 'center';
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
                text ? text : '',
                Math.min(
                    this.axes.size.width - 30,
                    Math.max(30, (t + 0.55) * scale + translate)
                ),
                scaleHeight * 0.3
            );
            ctx.restore();
        }
    };
};
