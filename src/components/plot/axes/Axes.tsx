import {
    DataRange,
    GridPosition,
    Padding,
    Point,
    Size
} from '../../../utils_refactor/types/display';
import NumberRange from '../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils_refactor/classes/iterable/DateTimeRange';
import {
    createRef,
    useEffect
} from 'react';
import {
    axisSize_
} from '../../../utils_refactor/constants/plot';
import YAxis from './axis/y/base';
import XAxis from './axis/x/base';
import XAxisGeometric from './axis/x/geometric';
import XAxisTimeSeries from './axis/x/timeSeries';
import {
    DrawingProps
} from '../drawing/Drawing';
import Drawing from '../drawing/Drawing';
import './Axes.css';

export declare type AxesPlaceholderProps = {
    children: React.ReactElement<DrawingProps<any>>
        | React.ReactElement<DrawingProps<any>>[];
    position: GridPosition;
    name: string;
    xAxis?: boolean;
    yAxis?: boolean;
    padding?: Padding;
}

export default function Axes(_: AxesPlaceholderProps) {
    return null;
};

export declare interface AxesProps extends AxesPlaceholderProps {
    size: Size;
    xAxisData: NumberRange | DateTimeRange;
}

export class AxesReal{
    public drawings: Drawing<any, any>[];
    public axis: {
        x: XAxis<any, any>,
        y: YAxis
    };
    public dataRange: DataRange = {
        start: 0,
        end: 1
    };
    public transformMatrix: DOMMatrix = new DOMMatrix([
        1, 0,
        0, 1,
        0, 0
    ]);
    public ctx: {
        main: CanvasRenderingContext2D | null | undefined;
        tooltip: CanvasRenderingContext2D | null | undefined;
    } = {
        main: null,
        tooltip: null
    };
    public density: number = 1;
    private readonly axisSize: {
        x: number;
        y: number;
    };
    private tooltips: React.ReactNode = null;
    private drag: boolean = false;
    public mousePos: Point = {
        x: 0,
        y: 0
    };

    public constructor(
        private rerender: () => void,
        drawings: Drawing<any, any>[],
        public position: GridPosition,
        public readonly name: string,
        public padding: Padding,
        public size: Size,
        xAxisData: NumberRange | DateTimeRange,
        xAxis: boolean = true,
        yAxis: boolean = true
    ) {
        this.drawings = drawings.map(drawing => {
            drawing.axes = this;
            return drawing;
        });

        this.axis = {
            x: xAxisData instanceof NumberRange ?
                new XAxisGeometric(this, xAxisData as NumberRange, xAxis) :
                new XAxisTimeSeries(this, xAxisData as DateTimeRange, xAxis),
            y: new YAxis(this, yAxis)
        };

        this.axisSize = {
            x: xAxis ? axisSize_.height : 0,
            y: yAxis ? axisSize_.width : 0
        };

        this.localize = this.localize.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseOutHandler = this.mouseOutHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.render = this.render.bind(this);
    }

    public localize(
        range: DataRange
    ) {
        this.drawings.forEach(drawing => drawing.localize(range));
        this.axis.x.transform();
        this.axis.y.transform();
        this.transformMatrix = new DOMMatrix([
            this.axis.x.local.scale + this.axis.x.delta.scale, 0,
            0, this.axis.y.local.scale + this.axis.y.delta.scale,
            this.axis.x.local.translate + this.axis.x.delta.translate,
            this.axis.y.local.translate + this.axis.y.delta.translate
        ]);
    }

    public draw() {
        this.ctx.main?.clearRect(
            0, 0,
            this.size.width,
            this.size.height
        )
        if (this.drawings.length) {
            this.axis.x.drawTicks();
            this.axis.y.drawTicks();
            this.drawings.forEach(drawing => drawing.draw());
        }
    }

    public drawTooltip(
        x: number,
        y: number
    ) {
        const ctx = this.ctx.tooltip;
        if (ctx) {
            ctx.clearRect(
                0, 0,
                this.size.width,
                this.size.height
            );
            if (this.drawings.length) {
                ctx.save();
                ctx.lineWidth = this.density;
                ctx.strokeStyle = '#696969';
                ctx.setLineDash([5, 5]);
                this.axis.x.drawTooltip(x);
                this.axis.y.drawTooltip(y);
                ctx.restore();
                this.drawings.forEach(drawing => drawing
                    .drawTooltip(x));

                this.tooltips = this.drawings.map(
                    drawing => drawing.tooltip(x));
                this.rerender();
            }
        }
    }

    public hideTooltip() {
        this.ctx.tooltip?.clearRect(
            0, 0,
            this.size.width,
            this.size.height
        );
        this.axis.x.hideTooltip();
        this.axis.y.hideTooltip();

        this.tooltips = null;
        this.rerender();
    }

    public mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement)
            .getBoundingClientRect();
        const x = event.clientX - window.left,
            y = event.clientY - window.top;
        if (this.drag)
            this.axis.x.reTranslate(x - this.mousePos.x);
            this.mousePos = { x, y };
            this.draw();
        this.drawTooltip(x, y);
    }

    public async mouseOutHandler(_: React.MouseEvent) {
        this.drag = false;
        this.hideTooltip();
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

    public mouseUpHandler() {
        this.drag = false;
    }

    public render() {
        const mainRef = createRef<HTMLCanvasElement>(),
            tooltipRef = createRef<HTMLCanvasElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.axis.x.wheelHandler, { passive: false });

            this.ctx = {
                main: mainRef.current?.getContext('2d'),
                tooltip: tooltipRef.current?.getContext('2d')
            };

            this.localize({
                start: this.axis.x.local.min / this.axis.x.global.max,
                end: this.axis.x.local.max / this.axis.x.global.max,
            });
            this.draw();
        }, []);

        return <div
            className={'axesGrid'}
            style={{
                width: this.size.width + this.axisSize.y,
                height: this.size.height + this.axisSize.x,
                gridRowStart: this.position.row.start,
                gridRowEnd: this.position.row.end,
                gridColumnStart: this.position.column.start,
                gridColumnEnd: this.position.column.end
            }}
        >
            <ul className={'axes tooltips'}>
                {this.tooltips}
            </ul>
            <canvas
                ref={mainRef}
                className={'axes plot scale'}
                style={{
                    width: this.size.width,
                    height: this.size.height
                }}
                width={this.size.width}
                height={this.size.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes plot tooltip'}
                style={{
                    width: this.size.width,
                    height: this.size.height
                }}
                width={this.size.width}
                height={this.size.height}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
            <this.axis.x.render />
            <this.axis.y.render />
            {/*{this.settings}*/}
        </div>;
    }
}
