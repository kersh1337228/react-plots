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

        for (const {
            data: {
                global: {
                    y: {
                        min,
                        max
                    }
                }
            }
        } of axes.drawings) {
            this.global.min = min < this.global.min ? min : this.global.min;
            this.global.max = this.global.max < max ? max : this.global.max;
        }

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
        this.local = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            scale: 1,
            translate: 0
        };

        for (const {
            visible,
            data: {
                local: {
                    y: {
                        min,
                        max
                    }
                }
            }
        } of this.axes.drawings)
            if (visible) {
                this.local.min = min < this.local.min ? min : this.local.min;
                this.local.max = this.local.max < max ? max : this.local.max;
            }

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
            for (let i = 0; i < this.grid.amount; ++i) {
                const y = (this.grid.amount - i) * step;

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

            const scale = this.local.scale + this.delta.scale;
            const step = this.axes.size.height / (this.grid.amount + 1) * this.axes.density;
            const dy = this.local.min + 0.5 * ((
                this.local.max - this.local.min
            ) - this.axes.size.height / scale);

            for (let i = 0; i < this.grid.amount; ++i) {
                const y = (this.grid.amount - i) * step;

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

                ctx.fillText(
                    numberPower(
                        dy + y / scale,
                        2
                    ),
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
        if (ctx) {
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

            const scale = this.local.scale + this.delta.scale;
            const dy = this.local.min + 0.5 * ((
                this.local.max - this.local.min
            ) - this.axes.size.height / scale);
            ctx.font = `${this.font.size}px ${this.font.family}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
                numberPower(
                    dy + y / scale, 2
                ),
                axisSize_.width * 0.05,
                y + 3
            );

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
