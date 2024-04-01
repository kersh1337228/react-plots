import {
    AxesPlaceholderProps,
    AxesReal
} from '../single/Axes';
import {
    DataRange,
    GridPosition,
    Point,
    Size
} from '../../../../utils_refactor/types/display';
import NumberRange from '../../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils_refactor/classes/iterable/DateTimeRange';
import {
    Children, createRef, useEffect
} from 'react';
import {
    DrawingProps
} from '../../drawing/Drawing';
import {
    fillData,
    plotDataTypeVectorised
} from '../../../../utils_refactor/functions/plotDataProcessing';
import {
    axisSize_
} from '../../../../utils_refactor/constants/plot';
import drawingModule from '../../drawing';
import XAxisNumeric from './axis/x/numeric';
import XAxisTimeSeries from './axis/x/timeSeries';
import './AxesGroup.css';

export declare type AxesGroupPlaceholderProps = {
    children: React.ReactElement<AxesPlaceholderProps>
        | React.ReactElement<AxesPlaceholderProps>[];
    position: GridPosition;
    name: string;
    xAxis?: boolean;
}

export default function AxesGroup(
    _: AxesGroupPlaceholderProps
) {
    return null;
}

export class AxesGroupReal {
    public axes: AxesReal[];
    public axis: XAxisNumeric | XAxisTimeSeries;
    public ctx: CanvasRenderingContext2D | null | undefined = null;
    private readonly axisSize: Point;
    public readonly rows: number;
    private drag: boolean = false;
    public mousePos: Point = {
        x: 0,
        y: 0
    };

    public constructor(
        private rerender: () => void,
        axes: React.ReactElement<AxesPlaceholderProps>
            | React.ReactElement<AxesPlaceholderProps>[],
        public position: GridPosition,
        public readonly name: string,
        public size: Size,
        xAxis: boolean = true
    ) {
        const drawings = new Array<
            React.ReactElement<DrawingProps<any>>
        >().concat(...Children.map(axes, child => child.props.children));

        const dType = plotDataTypeVectorised(drawings);
        let xAxisData: NumberRange | DateTimeRange,
            xAxisLabels: number[] | string[];
        if (dType)
            if (dType === 'Numeric') {
                xAxisData = NumberRange.plotNumberRange(drawings);
                xAxisLabels = [...xAxisData];
            } else {
                xAxisData = DateTimeRange.plotDateTimeRange(drawings);
                xAxisLabels = [...xAxisData.format('%Y-%m-%d')];
            }
        else
            throw Error('<Axes> drawings inside of <AxesGroup> must have uniform data type.');

        this.rows = Math.max.apply(null, Children.map(axes,
                child => child.props.position.row.end)) - 1;
        const cellHeight = size.height / this.rows;

        this.axes = Children.map(axes, child => {
            const drawings = Children.map(child.props.children, drawing => {
                if (!drawing.props.data.length)
                    throw Error('Drawing data can\'t be empty.');
                // @ts-ignore
                return new (drawingModule[`${drawing.type.name}Real`])(
                    fillData(drawing.props.data, xAxisLabels),
                    drawing.props.name,
                    drawing.props.style,
                    drawing.props.vfield
                );
            });

            return new AxesReal(
                rerender,
                drawings,
                {
                    row: child.props.position.row,
                    column: {
                        start: 1,
                        end: 3
                    }
                },
                child.props.name,
                {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    ...child.props.padding
                },
                {
                    width: size.width,
                    height: (
                        child.props.position.row.end -
                        child.props.position.row.start
                    ) * cellHeight,
                },
                xAxisData,
                false,
                child.props.yAxis ?? true
            );
        });

        this.axis = xAxisData instanceof NumberRange ?
            new XAxisNumeric(this, xAxis) :
            new XAxisTimeSeries(this, xAxis);

        this.axisSize = {
            x: xAxis ? axisSize_.height : 0,
            y: 0
        };

        this.localize = this.localize.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseOutHandler = this.mouseOutHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.render = this.render.bind(this);
    };

    public localize(
        range: DataRange
    ) {
        for (const axes of this.axes)
            axes.localize(range);
        // this.axis.x.transform();
    };

    public draw() {
        for (const axes of this.axes)
            axes.draw();
        this.axis.drawTicks();
    };

    public drawTooltip(
        x: number,
        y: number
    ) {
        this.axis.drawTooltip(x);

        let offset = y;
        for (const axes of this.axes) {
            axes.drawTooltip(x, offset);
            offset -= axes.size.height;
        }

        this.rerender();
    };

    public hideTooltip() {
        // this.ctx?.clearRect(
        //     0, 0,
        //     this.size.width,
        //     this.size.height
        // );
        this.axis.hideTooltip();

        for (const axes of this.axes)
            axes.hideTooltip();

        this.rerender();
    };

    public mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement)
            .getBoundingClientRect();
        const x = event.clientX - window.left,
            y = event.clientY - window.top;
        if (this.drag)
            this.axis.reTranslate(x - this.mousePos.x);
        this.mousePos = { x, y };
        this.draw();
        this.drawTooltip(x, y);
    };

    public async mouseOutHandler(_: React.MouseEvent) {
        this.drag = false;
        this.hideTooltip();
    };

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
    };

    public mouseUpHandler() {
        this.drag = false;
    };

    public render() {
        const tooltipRef = createRef<HTMLCanvasElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.axis.wheelHandler, { passive: false });
            // this.ctx = tooltipRef.current?.getContext('2d');
            const x = this.axes[0].axis.x;
            this.localize({
                start: x.local.min / x.global.max,
                end: x.local.max / x.global.max,
            });
            this.draw();
        }, []);

        return <div
            className={'axesGroupGrid'}
            style={{
                width: this.size.width + this.axisSize.y,
                height: this.size.height + this.axisSize.x,
                gridRowStart: this.position.row.start,
                gridRowEnd: this.position.row.end,
                gridColumnStart: this.position.column.start,
                gridColumnEnd: this.position.column.end
            }}
        >
            {this.axes.map(axes => <axes.render key={axes.name} />)}
            <div
                className={'axesGroup placeholder'}
                style={{
                    width: axisSize_.width,
                    height: this.size.height,
                    gridRowStart: 1,
                    gridRowEnd: this.rows + 1,
                    gridColumnStart: 1,
                    gridColumnEnd: 2
                }}
            ></div>
            <canvas
                ref={tooltipRef}
                className={'axesGroup tooltip'}
                style={{
                    width: this.size.width,
                    height: this.size.height,
                    gridRowStart: 1,
                    gridRowEnd: this.rows + 1,
                    gridColumnStart: 2,
                    gridColumnEnd: 3
                }}
                width={this.size.width}
                height={this.size.height}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas>
            <this.axis.render/>
            {/*<AxesGroupSettings axesGroup={this}/>*/}
        </div>
    };
}