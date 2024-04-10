import React from 'react';
import {
    AxisGrid,
    Font,
    Point
} from '../../../../../utils/types/display';
import {
    AxesReal
} from '../../single/Axes';
import {
    AxesGroupReal
} from '../../group/AxesGroup';

export default abstract class AxisBase<
    AxesT extends AxesReal | AxesGroupReal
> {
    protected ctx: {
        main: CanvasRenderingContext2D | null | undefined;
        tooltip: CanvasRenderingContext2D | null | undefined;
    } = {
        main: null,
        tooltip: null
    };
    protected drag: boolean = false;
    protected mousePos: Point = {
        x: 0,
        y: 0
    };

    protected constructor(
        protected axes: AxesT,
        protected label: 'x' | 'y',
        protected visible: boolean = true,
        protected scrollSpeed: number = 1,
        public readonly name: string = 'x',
        public readonly grid: AxisGrid = {
            amount: 5,
            color: '#d9d9d9',
            width: 1
        },
        public readonly font: Font = {
            family: 'Serif',
            size: 10
        }
    ) {
        this.reScale = this.reScale.bind(this);
        this.reTranslate = this.reTranslate.bind(this);
        this.drawTicks = this.drawTicks.bind(this);
        this.drawTooltip = this.drawTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.wheelHandler = this.wheelHandler.bind(this);
        this.doubleClickHandler = this.doubleClickHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseOutHandler = this.mouseOutHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.render = this.render.bind(this);
    }

    public abstract reset(): void;

    public abstract reScale(ds: number): void;

    public abstract reTranslate(dt: number): void;

    public abstract drawTicks(): void;

    public abstract drawTooltip(at: number): void;

    public hideTooltip() {
        this.ctx.tooltip?.clearRect(
            0, 0,
            this.ctx.tooltip?.canvas.width,
            this.ctx.tooltip?.canvas.height
        );
    };

    public wheelHandler(event: WheelEvent) {
        if (this.axes.active) {
            event.preventDefault();
            event.stopPropagation();
            this.reScale(-event.deltaY / 2000);
            this.axes.draw();
        }
    };

    public doubleClickHandler(_: React.MouseEvent) {
        if (this.axes.active) {
            this.reset();
            this.reScale(0);
            this.axes.draw();
        }
    }

    public mouseMoveHandler(event: React.MouseEvent) {
        if (this.axes.active && this.drag) {
            const window = (event.target as HTMLCanvasElement)
                .getBoundingClientRect();
            const coordinates = {
                x: event.clientX - window.left,
                y: event.clientY - window.top
            };
            this.reScale((this.mousePos[this.label]
                - coordinates[this.label]) * this.scrollSpeed);
            this.axes.draw();
            this.mousePos = coordinates;
        }
    };

    public mouseOutHandler(_: React.MouseEvent) {
        this.drag = false;
    };

    public mouseDownHandler(event: React.MouseEvent) {
        if (this.axes.active) {
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

    public mouseUpHandler(_: React.MouseEvent) {
        this.drag = false;
    };

    public abstract render(): React.ReactNode;
};
