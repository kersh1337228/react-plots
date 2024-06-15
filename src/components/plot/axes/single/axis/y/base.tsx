'use client';

import {
    axisSize_
} from '../../../../../../utils/constants/plot';
import React, {
    createRef,
    useEffect
} from 'react';
import {
    numberPower,
    truncate
} from '../../../../../../utils/functions/numberProcessing';
import {
    AxesReal
} from '../../Axes';
import {
    AxisGrid,
    Font
} from '../../../../../../utils/types/display';
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
        super(axes, 'y', visible, 0.01, name, grid, font);

        for (const {
            data: {
                global: {
                    y: {
                        min,
                        max
                    }
                }
            }
        } of this.axes.drawings) {
            this.global.min = min < this.global.min ? min : this.global.min;
            this.global.max = this.global.max < max ? max : this.global.max;
        }
        this.init();
        this.local = structuredClone(this.global);
    };

    public override init() {
        const top = this.axes.size.height * (1 - this.axes.padding.bottom),
            bottom = this.axes.size.height * this.axes.padding.top;

        this.global.scale = (bottom - top) / (this.global.max - this.global.min);
        this.global.translate = top - (bottom - top) /
            (this.global.max - this.global.min) * this.global.min;
    }

    public override reset() {
        this.delta.scale = 0;
        this.delta.translate = 0;

        this.axes.transformMatrix.d = this.local.scale + this.delta.scale;
        this.axes.transformMatrix.f = this.local.translate + this.delta.translate;
    }

    public override reScale(ds: number) {
        this.delta.scale += ds * (this.local.scale + this.delta.scale);
        // translate = -invariant * delta.scale
        this.delta.translate = -0.5 * (
            this.local.max + this.local.min
        ) * this.delta.scale;

        this.axes.transformMatrix.d = this.local.scale + this.delta.scale;
        this.axes.transformMatrix.f = this.local.translate + this.delta.translate;
    };

    public override reTranslate(dt: number) {
        if (this.delta.scale) {
            this.delta.translate += dt;

            this.axes.transformMatrix.d = this.local.scale + this.delta.scale;
            this.axes.transformMatrix.f = this.local.translate + this.delta.translate;
        }
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

        const top = this.axes.size.height * (1 - this.axes.padding.bottom),
            bottom = this.axes.size.height * this.axes.padding.top;

        this.local.scale = (bottom - top) / (this.local.max - this.local.min);
        this.local.translate = top - this.local.scale * this.local.min;

        this.delta.translate = -0.5 * (
            this.local.max + this.local.min
        ) * this.delta.scale;
    };

    public override drawGrid() {
        const ctx = this.axes.ctx.grid as CanvasRenderingContext2D;
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
            ) - this.axes.size.height * (
                1 - this.axes.padding.bottom + this.axes.padding.top
            ) / scale);

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
        const axesCtx = this.axes.ctx.tooltip as CanvasRenderingContext2D;
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
            if (0 < y && y < this.axes.size.height) {
                ctx.save();

                ctx.fillStyle = '#323232';
                ctx.fillRect(
                    0,
                    truncate(
                        y - 13,
                        0,
                        this.axes.size.height - 26
                    ),
                    axisSize_.width,
                    26
                );

                const scale = this.local.scale + this.delta.scale;
                const dy = this.local.min + 0.5 * ((
                    this.local.max - this.local.min
                ) - this.axes.size.height * (
                    1 - this.axes.padding.bottom + this.axes.padding.top
                ) / scale);
                ctx.font = `${this.font.size}px ${this.font.family}`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'right';
                ctx.fillText(
                    numberPower(
                        dy + y / scale, 2
                    ),
                    axisSize_.width * 0.85,
                    truncate(
                        y + 3,
                        16,
                        this.axes.size.height - 10
                    )
                );

                ctx.restore();
            }
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
                className={'axis viewport y main'}
                style={{
                    width: axisSize_.width,
                    height: this.axes.size.height
                }}
                width={axisSize_.width}
                height={this.axes.size.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axis viewport y tooltip'}
                style={{
                    width: axisSize_.width,
                    height: this.axes.size.height
                }}
                width={axisSize_.width}
                height={this.axes.size.height}
                onDoubleClick={this.doubleClickHandler}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null;
    };
}
