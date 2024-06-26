'use client';

import React, {
    createRef,
    useEffect
} from 'react';
import {
    truncate
} from '../../../../../../utils/functions/numberProcessing';
import {
    axisSize_
} from '../../../../../../utils/constants/plot';
import {
    AxisGrid,
    Bounds,
    Font
} from '../../../../../../utils/types/display';
import NumberRange from '../../../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../../../utils/classes/iterable/DateTimeRange';
import Axis from '../base';
import {
    AxesReal
} from '../../Axes';

export default abstract class XAxis<
    DataT extends NumberRange | DateTimeRange
> extends Axis {
    protected constructor(
        axes: AxesReal,
        public readonly data: DataT,
        delta: Bounds,
        visible: boolean = true,
        scrollSpeed: number = 1,
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
        super(axes, 'x', visible, scrollSpeed, name, grid, font);

        this.delta = {
            ...this.delta,
            ...delta
        };

        for (const {
            data: {
                global: {
                    x: {
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
        this.reset();
    }

    public override init() {
        const left = this.axes.size.width * this.axes.padding.left,
            right = this.axes.size.width * (1 - this.axes.padding.right);

        this.global.scale = (right - left) / (this.global.max - this.global.min);
        this.global.translate = left - this.global.scale * this.global.min;
    }

    public override reset() {
        this.delta.scale = 0;
        this.delta.translate = 0;

        this.local = structuredClone(this.global);

        if (this.global.max > this.delta.max) {
            this.local.min = this.global.max - this.delta.max;

            const left = this.axes.size.width * this.axes.padding.left,
                right = this.axes.size.width * (1 - this.axes.padding.right);

            this.delta.scale = (right - left) * (
                1 / this.delta.max - 1 / (this.global.max - this.global.min));
            this.delta.translate = (right - left) * (this.global.min /
                (this.global.max - this.global.min) - this.local.min / this.delta.max);
        }
    }

    public override reScale(ds: number) {
        const left = this.axes.size.width * this.axes.padding.left,
            right = this.axes.size.width * (1 - this.axes.padding.right);

        const viewportSize = right - left,
            globalSpread = this.global.max - this.global.min,
            iGlobalSpread = 1 / globalSpread;

        this.delta.scale = truncate(
            this.delta.scale + ds * (this.local.scale + this.delta.scale),
            viewportSize * (1 / this.delta.max - iGlobalSpread),
            viewportSize * (1 / this.delta.min - iGlobalSpread)
        );

        this.local.min = truncate(
            this.local.max - 1 / (iGlobalSpread + this.delta.scale / viewportSize),
            this.global.min,
            this.global.max - this.delta.min
        );
        const dt = left - this.local.min * (this.local.scale + this.delta.scale)
            - (this.local.translate + this.delta.translate);
        this.delta.translate += dt

        const multiplier = viewportSize / (viewportSize + this.delta.scale * globalSpread);
        const offset = multiplier * this.delta.translate / this.global.scale;
        this.local.min = truncate(
            multiplier * this.global.min - offset,
            this.global.min,
            this.global.max - this.delta.min
        );
        this.local.max = truncate(
            multiplier * this.global.max - offset,
            this.global.min + this.delta.min,
            this.global.max
        );

        this.axes.localize({
            start: this.local.min / this.global.max,
            end: this.local.max / this.global.max,
        });
    }

    public override reTranslate(dt: number) {
        const left = this.axes.size.width * this.axes.padding.left,
            right = this.axes.size.width * (1 - this.axes.padding.right);

        const viewportSize = right - left,
            dtgs = this.delta.translate / this.global.scale;

        const multiplier = viewportSize / (
            viewportSize + this.delta.scale * (this.global.max - this.global.min));
        let offset = multiplier * dtgs;
        const min = this.global.max * (1 - multiplier) + offset,
            max = this.global.min * (1 - multiplier) + offset;
        this.delta.translate += dt - (
            (min < 0 ? min : 0) + (0 < max ? max : 0)
        ) * (this.local.scale + this.delta.scale);

        offset = multiplier * dtgs;
        this.local.min = truncate(
            multiplier * this.global.min - offset,
            this.global.min,
            this.global.max - this.delta.min
        );
        this.local.max = truncate(
            multiplier * this.global.max - offset,
            this.global.min + this.delta.min,
            this.global.max
        );

        this.axes.localize({
            start: this.local.min / this.global.max,
            end: this.local.max / this.global.max,
        });
    }

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
                className={'axis viewport x main'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axis viewport x tooltip'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
                onDoubleClick={this.doubleClickHandler}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null;
    }
};
