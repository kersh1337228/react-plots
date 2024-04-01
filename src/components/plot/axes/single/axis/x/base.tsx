import React, {
    createRef,
    useEffect
} from 'react';
import {
    truncate
} from '../../../../../../utils_refactor/functions/numberProcessing';
import {
    axisSize_
} from '../../../../../../utils_refactor/constants/plot';
import {
    AxisGrid,
    Font
} from '../../../../../../utils_refactor/types/display';
import NumberRange from '../../../../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../../../../utils_refactor/classes/iterable/DateTimeRange';
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

        const left = axes.size.width * axes.padding.left,
            right = axes.size.width * (1 - axes.padding.right);

        this.global.min = Math.min.apply(null, this.axes.drawings
            .map(drawing => drawing.local.x.min));
        this.global.max = Math.max.apply(null, this.axes.drawings
            .map(drawing => drawing.local.x.max));

        this.global.scale = (right - left) / (this.global.max - this.global.min);
        this.global.translate = left - (right - left) /
            (this.global.max - this.global.min) * this.global.min;

        this.local = { ...this.global };
        if (this.global.max > this.delta.max) {
            this.local.min = this.global.max - this.delta.max;
            this.delta.scale = (right - left) * (
                1 / this.delta.max - 1 / (this.global.max - this.global.min));
            this.delta.translate = (right - left) * (this.global.min /
                (this.global.max - this.global.min) - this.local.min / this.delta.max);
        }
    }

    public override reScale(ds: number) {
        const left = this.axes.size.width * this.axes.padding.left,
            right = this.axes.size.width * (1 - this.axes.padding.right);

        this.delta.scale = truncate(
            this.delta.scale + ds * (this.local.scale + this.delta.scale),
            (right - left) * (
                1 / this.delta.max - 1 / (this.global.max - this.global.min)),
            (right - left) * (
                1 / this.delta.min - 1 / (this.global.max - this.global.min))
        );

        this.local.min = truncate(
            this.local.max - 1 / (
                1 / (this.global.max - this.global.min) + this.delta.scale / (right - left)),
            this.global.min,
            this.global.max - this.delta.min
        );

        const dt = left - this.local.min * (this.local.scale + this.delta.scale)
            - (this.local.translate + this.delta.translate);
        this.delta.translate += dt
        const multiplier = (right - left) / (
            right - left + this.delta.scale * (this.global.max - this.global.min));
        const offset = multiplier * this.delta.translate / this.global.scale;
        this.local.max = truncate(
            multiplier * this.global.max - offset,
            this.global.min + this.delta.min,
            this.global.max
        );
        this.local.min = truncate(
            multiplier * this.global.min - offset,
            this.global.min,
            this.global.max - this.delta.min
        );

        this.axes.localize({
            start: this.local.min / this.global.max,
            end: this.local.max / this.global.max,
        });
    }

    public override reTranslate(dt: number) {
        const left = this.axes.size.width * this.axes.padding.left,
            right = this.axes.size.width * (1 - this.axes.padding.right);

        this.delta.translate += dt;
        const multiplier = (right - left) / (
            right - left + this.delta.scale * (this.global.max - this.global.min));
        let offset = multiplier * this.delta.translate / this.global.scale;

        this.delta.translate -= (
            Math.min(0, this.global.max * (1 - multiplier) + offset)
            + Math.max(0, this.global.min * (1 - multiplier) + offset)
        ) * (this.local.scale + this.delta.scale);

        offset = multiplier * this.delta.translate / this.global.scale;
        this.local.max = truncate(
            multiplier * this.global.max - offset,
            this.global.min + this.delta.min,
            this.global.max
        );
        this.local.min = truncate(
            multiplier * this.global.min - offset,
            this.global.min,
            this.global.max - this.delta.min
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
                className={'axes x scale'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes x tooltip'}
                style={{
                    width: this.axes.size.width,
                    height: axisSize_.height
                }}
                width={this.axes.size.width}
                height={axisSize_.height}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
        </> : null;
    }
};
