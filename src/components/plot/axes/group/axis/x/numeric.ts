import XAxis from './base';
import NumberRange from '../../../../../../utils_refactor/classes/iterable/NumberRange';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import {
    AxesGroupReal
} from '../../AxesGroup';
import {
    numberPower
} from '../../../../../../utils_refactor/functions/numberProcessing';
import { axisSize_ } from '../../../../../../utils_refactor/constants/plot';

export default class XAxisNumeric extends XAxis {
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
        super(axes, visible, 1, name, grid, font);
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
                axis = axes.x;
            const spread = axis.local.max - axis.local.min;
            const scale = axis.local.scale + axis.delta.scale;
            const translate = axis.local.translate + axis.delta.translate;
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
                                1 - axes.padding.left - axes.padding.right
                            ) - 1 / scale
                        ) + axis.local.min - axes.padding.right *
                        this.axes.size.width / scale, 2
                    ),
                    x,
                    scaleHeight * 0.3
                );
            }
            ctx.restore();
        }
    };

    public override drawTooltip(x: number) {
        const axis = this.axes.axes[0].x;
        const scale = axis.local.scale + axis.delta.scale;
        const translate = axis.local.translate + axis.delta.translate;

        const i = (axis.data as NumberRange).indexOf(
            (x - translate) / scale
        ) as number;
        const xi = axis.data.at(i) as number;

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
            const text = (axis.data as NumberRange).formatAt(i, '%.2f');
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
    };
};
