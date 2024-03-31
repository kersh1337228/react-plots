import {
    AxisData,
    AxisGrid,
    Font,
    Point
} from '../../../../utils_refactor/types/display';
import {
    AxesReal
} from '../Axes';

export declare type AxisContext = {
    global: AxisData;
    local: AxisData;
    delta: AxisData;
};

export default abstract class Axis<
    AxesT extends AxesReal
        // | AxesGroupReal
> {
    public readonly global: AxisData = {
        min: 0,
        max: 0,
        scale: 1,
        translate: 0
    };
    public local: AxisData = {
        min: 0,
        max: 0,
        scale: 1,
        translate: 0
    };
    public delta: AxisData = {
        min: 5,
        max: 500,
        scale: 0,
        translate: 0
    };
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
        public readonly name: string = label,
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
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseOutHandler = this.mouseOutHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.render = this.render.bind(this);
    }

    public abstract reScale(ds: number): void;

    public abstract reTranslate(dt: number): void;

    public abstract transform(): void;

    public abstract drawTicks(): void;

    public abstract drawTooltip(at: number): void;

    public hideTooltip() {
        this.ctx.tooltip?.clearRect(
            0, 0,
            this.ctx.tooltip?.canvas.width,
            this.ctx.tooltip?.canvas.height
        );
    }

    public abstract render(): React.ReactNode;

    public wheelHandler(event: WheelEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.reScale(
            -event.deltaY / 2000 * (this.local.scale + this.delta.scale)
        );
        this.axes.draw();
        this.axes.drawTooltip(
            this.axes.mousePos.x,
            this.axes.mousePos.y
        );
    }

    public mouseMoveHandler(event: React.MouseEvent) {
        if (this.drag) {
            const window = (event.target as HTMLCanvasElement)
                .getBoundingClientRect();
            const coordinates = {
                x: event.clientX - window.left,
                y: event.clientY - window.top
            };
            this.reScale((this.mousePos[this.label] - coordinates[this.label])
                * this.scrollSpeed * (this.local.scale + this.delta.scale));
            this.axes.draw();
            this.mousePos = coordinates;
        }
    }

    public mouseOutHandler(_: React.MouseEvent) {
        this.drag = false;
    }

    public mouseDownHandler(event: React.MouseEvent) {
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

    public mouseUpHandler(_: React.MouseEvent) {
        this.drag = false;
    }
};
