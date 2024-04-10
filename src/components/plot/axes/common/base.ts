import React from 'react';
import {
    DataRange,
    Point, Size
} from '../../../../utils/types/display';
import AxisBase from './axis/base';
import {
    axisSize_
} from '../../../../utils/constants/plot';

export default abstract class AxesBase<
    XAxisT extends AxisBase<any>
> {
    public active: boolean = true;
    // @ts-ignore
    public x: XAxisT;
    public size: Size;
    public readonly axisSize: Point;
    protected drag: boolean = false;
    public mousePos: Point = {
        x: 0,
        y: 0
    };

    protected constructor(
        size: Size,
        x: boolean
    ) {
        this.axisSize = {
            x: axisSize_.height * +x,
            y: axisSize_.width,
        };
        this.size = {
            width: size.width - this.axisSize.y,
            height: size.height - this.axisSize.x
        };

        this.localize = this.localize.bind(this);
        this.draw = this.draw.bind(this);
        this.drawTooltip = this.drawTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseOutHandler = this.mouseOutHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.render = this.render.bind(this);
    }

    public abstract localize(
        range: DataRange
    ): void;

    public abstract draw(): void;

    public abstract drawTooltip(
        x: number,
        y: number
    ): void;

    public abstract hideTooltip(): void;

    public mouseMoveHandler(event: React.MouseEvent) {
        if (this.active) {
            const window = (event.target as HTMLCanvasElement)
                .getBoundingClientRect();
            const x = event.clientX - window.left,
                y = event.clientY - window.top;
            if (this.drag)
                this.x.reTranslate(x - this.mousePos.x);
            this.mousePos = { x, y };
            this.draw();
            this.drawTooltip(x, y);
        }
    };

    public async mouseOutHandler(_: React.MouseEvent) {
        if (this.active) {
            this.drag = false;
            this.hideTooltip();
        }
    };

    public mouseDownHandler(event: React.MouseEvent) {
        if (this.active) {
            this.drag = true;
            this.mousePos = {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            };
        }
    };

    public mouseUpHandler() {
        this.drag = false;
    };

    public abstract render(): React.ReactNode;
};
