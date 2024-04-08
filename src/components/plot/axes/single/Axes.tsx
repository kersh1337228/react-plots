import {
    DataRange,
    GridPosition,
    Padding,
    Size
} from '../../../../utils/types/display';
import NumberRange from '../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils/classes/iterable/DateTimeRange';
import React, {
    createRef,
    useEffect
} from 'react';
import YAxis from './axis/y/base';
import XAxisNumeric from './axis/x/numeric';
import XAxisTimeSeries from './axis/x/timeSeries';
import {
    DrawingProps
} from '../../drawing/base/Drawing';
import Drawing from '../../drawing/base/Drawing';
import './Axes.css';
import AxesBase from '../common/base';
import Settings from './settings/Settings';

export declare type AxesPlaceholderProps = {
    children: React.ReactElement<DrawingProps<any>>
        | React.ReactElement<DrawingProps<any>>[];
    position: GridPosition;
    name: string;
    xAxis?: boolean;
    yAxis?: boolean;
    padding?: Padding;
}

export default function Axes(
    _: AxesPlaceholderProps
) {
    return null;
};

export class AxesReal extends AxesBase<
    XAxisNumeric | XAxisTimeSeries
> {
    public drawings: Drawing<any, any>[];
    public y: YAxis;
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
    private tooltips: React.JSX.Element[] | null = null;

    public constructor(
        private rerender: () => void,
        drawings: Drawing<any, any>[],
        public position: GridPosition,
        public readonly name: string,
        public padding: Padding,
        size: Size,
        xAxisData: NumberRange | DateTimeRange,
        xAxis: boolean = true,
        yAxis: boolean = true,
        private settings: boolean = true
    ) {
        super(size, settings);

        this.drawings = drawings.map(drawing => {
            drawing.axes = this;
            return drawing;
        });

        this.x = xAxisData instanceof NumberRange ?
            new XAxisNumeric(this, xAxisData as NumberRange, xAxis) :
            new XAxisTimeSeries(this, xAxisData as DateTimeRange, xAxis);
        this.y = new YAxis(this, yAxis);
    }

    public override localize(
        range: DataRange
    ) {
        for (const drawing of this.drawings)
            drawing.data.localize(range);
        // this.x.transform();
        this.y.transform();
        this.transformMatrix = new DOMMatrix([
            this.x.local.scale + this.x.delta.scale, 0,
            0, this.y.local.scale + this.y.delta.scale,
            this.x.local.translate + this.x.delta.translate,
            this.y.local.translate + this.y.delta.translate
        ]);
    };

    public override draw() {
        this.ctx.main?.clearRect(
            0, 0,
            this.size.width,
            this.size.height
        );
        if (this.drawings.length) {
            this.x.drawGrid();
            this.x.drawTicks();
            this.y.drawGrid();
            this.y.drawTicks();
            for (const drawing of this.drawings)
                drawing.draw();
        }
    };

    public override drawTooltip(
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
                this.x.drawTooltip(x);
                this.y.drawTooltip(y);
                ctx.restore();

                this.tooltips = [];
                for (const drawing of this.drawings) {
                    drawing.drawTooltip(x);
                    this.tooltips.push(drawing.data.tooltip(x));
                }

                this.rerender();
            }
        }
    };

    public override hideTooltip() {
        this.ctx.tooltip?.clearRect(
            0, 0,
            this.size.width,
            this.size.height
        );
        this.x.hideTooltip();
        this.y.hideTooltip();

        this.tooltips = null;
        this.rerender();
    };

    public override render() {
        const mainRef = createRef<HTMLCanvasElement>(),
            tooltipRef = createRef<HTMLCanvasElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.x.wheelHandler, { passive: false });

            this.ctx = {
                main: mainRef.current?.getContext('2d'),
                tooltip: tooltipRef.current?.getContext('2d')
            };

            this.x.reScale(0);
            this.draw();
        }, []);

        return <div
            className={'axes-grid'}
            style={{
                width: this.size.width + this.axisSize.y,
                height: this.size.height + this.axisSize.x,
                gridRowStart: this.position.row.start,
                gridRowEnd: this.position.row.end,
                gridColumnStart: this.position.column.start,
                gridColumnEnd: this.position.column.end
            }}
        >
            <ul className={'axes-tooltips'}>
                {this.tooltips}
            </ul>
            <canvas
                ref={mainRef}
                className={'axes viewport main'}
                style={{
                    width: this.size.width,
                    height: this.size.height
                }}
                width={this.size.width}
                height={this.size.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes viewport tooltip'}
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
            <this.x.render />
            <this.y.render />
            <Settings
                axes={this}
                visible={this.settings}
            />
        </div>;
    };
}
