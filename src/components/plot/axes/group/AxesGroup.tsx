'use client';

import {
    AxesPlaceholderProps,
    AxesReal
} from '../single/Axes';
import {
    DataRange,
    GridPosition,
    Size
} from '../../../../utils/types/display';
import NumberRange from '../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils/classes/iterable/DateTimeRange';
import React, {
    Children,
    createRef,
    ReactElement,
    useEffect
} from 'react';
import {
    DrawingProps
} from '../../drawing/base/Drawing';
import {
    expandFragments,
    fillData,
    plotDataTypeVectorised
} from '../../../../utils/functions/plotDataProcessing';
import drawingModule from '../../drawing';
import XAxisNumeric from './axis/x/numeric';
import XAxisTimeSeries from './axis/x/timeSeries';
import './AxesGroup.css';
import AxesBase from '../common/base';
import AxesGroupSettings from './settings/Settings';

export type AxesGroupPlaceholderProps = {
    children: any;
    position: GridPosition;
    name: string;
    xAxis?: boolean;
    settings?: boolean;
}

export default function AxesGroup(
    _: AxesGroupPlaceholderProps
) {
    return null;
}

export class AxesGroupReal extends AxesBase<
    XAxisNumeric | XAxisTimeSeries
> {
    public axes: AxesReal[];
    public ctx: CanvasRenderingContext2D | null | undefined = null;
    public readonly rows: number;

    public constructor(
        public rerender: () => void,
        axes: React.ReactElement<AxesPlaceholderProps>[],
        public position: GridPosition,
        public readonly name: string,
        size: Size,
        xAxis: boolean = true,
        settings: boolean = false
    ) {
        const drawings = axes.flatMap(child =>
            expandFragments(child.props.children)
        );

        const dType = plotDataTypeVectorised(drawings);

        let xAxisData: NumberRange | DateTimeRange,
            xAxisLabels: number[] | string[];

        if (dType)
            if (dType === 'Numeric') {
                xAxisData = NumberRange.plotNumberRange(drawings);
                xAxisLabels = [...xAxisData];
            } else {
                xAxisData = DateTimeRange.plotDateTimeRange(drawings);
                xAxisLabels = [...xAxisData.format()];
            }
        else
            throw Error('<Axes> drawings inside of <AxesGroup> must have uniform data type.');

        let yAxis = true;
        let left = 0, right = 0;
        let rows = 0;
        for (const child of Children.toArray(axes) as ReactElement<AxesPlaceholderProps>[]) {
            rows = Math.max(rows, child.props.position.row.end);
            if (yAxis && child.props.yAxis === false)
                yAxis = false;
            left = Math.max(left, child.props.padding?.left ?? 0);
            right = Math.max(right, child.props.padding?.right ?? 0);
        }

        const x = xAxis || settings,
            y = yAxis || settings;
        super(size, x, y);

        this.settings = <AxesGroupSettings
            group={this}
            icon={settings}
            visible={x && y}
        />;

        this.rows = rows - 1;
        const cellHeight = size.height / this.rows;

        this.axes = axes.map(child => {
            const flat = expandFragments(
                child.props.children
            ) as React.ReactElement<DrawingProps<any>>[];

            const drawings = flat.map(drawing => {
                if (!drawing.props.data.length)
                    throw Error('Drawing data can\'t be empty.');
                // @ts-ignore
                return new (drawingModule[`${drawing.type.name}Real`])(
                    fillData(drawing.props.data, xAxisLabels),
                    drawing.props.name,
                    drawing.props.style,
                    xAxisData,
                    drawing.props.vfield
                );
            });

            return new AxesReal(
                () => {},
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
                    left: left,
                    top: child.props.padding?.top ?? 0,
                    right: right,
                    bottom: child.props.padding?.bottom ?? 0,
                },
                {
                    width: size.width,
                    height: (
                        child.props.position.row.end -
                        child.props.position.row.start
                    ) * cellHeight - this.axisSize.x / this.rows,
                },
                xAxisData,
                false,
                y,
                false,
                true
            );
        });

        this.x = xAxisData instanceof NumberRange ?
            new XAxisNumeric(this, xAxis) :
            new XAxisTimeSeries(this, xAxis);
    };

    public localize(
        range: DataRange
    ) {
        for (const axes of this.axes)
            axes.localize(range);
        // this.x.transform();
    };

    public draw() {
        for (const axes of this.axes)
            axes.draw();
        this.x.drawTicks();
    };

    public drawTooltip(
        x: number,
        y: number
    ) {
        this.x.drawTooltip(x);

        let offset = y;
        for (const axes of this.axes) {
            axes.drawTooltip(x, offset);
            offset -= axes.size.height;
        }

        this.rerender();
    };

    public hideTooltip() {
        this.x.hideTooltip();

        for (const axes of this.axes)
            axes.hideTooltip();

        this.rerender();
    };

    public render() {
        const tooltipRef = createRef<HTMLDivElement>();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            tooltipRef.current?.addEventListener(
                'wheel', this.wheelHandler, { passive: false });

            this.x.drawTicks();
        }, [this.size.width, this.size.height]);

        return <div
            className={'group-grid'}
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
                className={'axis-placeholder'}
                style={{
                    width: this.axisSize.y,
                    height: this.size.height,
                    gridRowStart: 1,
                    gridRowEnd: this.rows + 1,
                    gridColumnStart: 1,
                    gridColumnEnd: 2
                }}
            ></div>
            <div
                ref={tooltipRef}
                className={'group-tooltip'}
                style={{
                    width: this.size.width,
                    height: this.size.height,
                    gridRowStart: 1,
                    gridRowEnd: this.rows + 1,
                    gridColumnStart: 2,
                    gridColumnEnd: 3
                }}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></div>
            <this.x.render/>
            {this.settings}
        </div>
    };
}
