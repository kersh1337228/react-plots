import { DataRange, GridPosition, Padding2D, Size2D } from '../../../utils/types/display';
import NumberRange from '../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils/classes/iterable/DateTimeRange';
import React, { createContext, useReducer, useRef, useState } from 'react';
import { DrawingProps } from '../drawing/base';
import { axisSize_ } from '../../../utils/constants/plot';

declare type AxesPlaceholderProps = {
    children: (React.FunctionComponentElement<
        DrawingProps<Record<string, any>>
    > & React.JSX.Element)[];
    position: GridPosition;
    xAxis?: boolean;
    yAxis?: boolean;
    padding?: Padding2D;
    title: string;
};

export default function Axes(_: AxesPlaceholderProps) {};

declare interface AxesProps extends AxesPlaceholderProps {
    size: Size2D;
    xAxisData: NumberRange | DateTimeRange;
}

declare type AxesContext = {
    dataRange: DataRange;
    dataAmount: number;
    transformMatrix: DOMMatrix;
    tooltips: React.ReactNode;
    plotCtx: CanvasRenderingContext2D;
    mouseEvents: {
        drag: boolean;
        position: {
            x: number;
            y: number;
        };
    };
    axes: {
        x: {
            data: NumberRange | DateTimeRange;
            scale: number;
            translate: number;
        }
        y: {
            scale: number;
            translate: number;
        }
    }
};

const contextInit = {
    dataRange: { start: 0, end: 1 },
    dataAmount: 0,
    transformMatrix: new DOMMatrix([ 1, 0, 0, 1, 0, 0 ]),
    tooltips: null
} as AxesContext;

export const AxesContext = createContext<AxesContext>(contextInit);

export function Axes_(props: AxesProps) {
    const [context, dispatch] = useReducer(
        (prevState: AxesContext, action: any) => {
            return prevState;
        }, contextInit);

    const plotRef = useRef<HTMLCanvasElement>(null),
        tooltipRef = useRef<HTMLCanvasElement>(null);

    const [size, setSize] = useState(props.size);
    const [position, setPosition] = useState(props.position);
    const axisSize = {
        x: props.xAxis ? axisSize_.height : 0,
        y: props.yAxis ? axisSize_.width : 0
    };

    return <div
        className={'axesGrid'}
        style={{
            width: size.width + axisSize.y,
            height: size.height + axisSize.x,
            gridRowStart: position.row.start,
            gridRowEnd: position.row.end,
            gridColumnStart: position.column.start,
            gridColumnEnd: position.column.end
        }}
    >
        <div className={'axes tooltips'}>
            {context.tooltips}
        </div>
        <canvas
            ref={plotRef}
            className={'axes plot scale'}
            style={{
                width: size.width,
                height: size.height
            }}
        ></canvas>
        <canvas
            ref={tooltipRef}
            className={'axes plot tooltip'}
            style={{
                width: size.width,
                height: size.height
            }}
            onMouseMove={this.mouseMoveHandler}
            onMouseOut={this.mouseOutHandler}
            onMouseDown={this.mouseDownHandler}
            onMouseUp={this.mouseUpHandler}
        ></canvas>
        {/*TODO: add dispatch*/}
        <AxesContext.Provider value={context}>
            {props.children}
            {this.state.axes.x.render()}
            {this.state.axes.y.render()}
            {this.settings}
        </AxesContext.Provider>
    </div>;
}
