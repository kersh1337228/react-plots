import {
    DrawingComponent
} from '../drawing/Drawing';
import {
    DataRange,
    GridPosition,
    Padding,
    Size
} from '../../../utils_refactor/types/display';
import NumberRange from '../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils_refactor/classes/iterable/DateTimeRange';
import {
    DrawingContext
} from '../drawing/Drawing';
import {
    createContext, useEffect,
    useReducer,
    useRef, useState
} from 'react';
import {
    XAxisContext
} from './axis/x/base';
import {
    AxisContext
} from './axis/base';
import {
    axisSize_
} from '../../../utils_refactor/constants/plot';
import YAxis from './axis/y/base';
import XAxisGeometrical from './axis/x/geometrical';

export declare type AxesPlaceholderProps = {
    children: DrawingComponent | DrawingComponent[];
    position: GridPosition;
    name: string;
    xAxis?: boolean;
    yAxis?: boolean;
    padding?: Padding;
}

export default function Axes(_: AxesPlaceholderProps) {
    return null;
};

export declare type AxesComponent = React.FunctionComponentElement<
    AxesPlaceholderProps
> & React.JSX.Element;

export declare interface AxesProps extends AxesPlaceholderProps {
    size: Size;
    xAxisData: NumberRange | DateTimeRange;
}

export declare type AxesState = {

}

export declare type AxesContext = {
    drawings: {
        [name: string]: DrawingContext;
    };
    axis: {
        x: XAxisContext;
        y: AxisContext;
    };
    dataRange: DataRange;
    dataAmount: number;
    transformMatrix: DOMMatrix;
    tooltips: React.ReactNode;
    ctx: {
        plot: CanvasRenderingContext2D | null;
        tooltip: CanvasRenderingContext2D | null;
    };
    density: number;
    padding: {
        left: number
        top: number
        right: number
        bottom: number
    };
    size: Size;
}

const contextInit = {
    drawings: {},
    axis: {
        x: {
            global: {
                min: 0,
                max: 0,
                scale: 1,
                translate: 0
            },
            local: {
                min: 0,
                max: 0,
                scale: 1,
                translate: 0
            },
            delta: {
                min: 0,
                max: 0,
                scale: 0,
                translate: 0
            }
        },
        y: {
            global: {
                min: 0,
                max: 0,
                scale: 1,
                translate: 0
            },
            local: {
                min: 0,
                max: 0,
                scale: 1,
                translate: 0
            },
            delta: {
                min: 0,
                max: 0,
                scale: 0,
                translate: 0
            }
        }
    },
    dataRange: { start: 0, end: 1 },
    dataAmount: 0,
    transformMatrix: new DOMMatrix([1, 0, 0, 1, 0, 0]),
    tooltips: null,
    ctx: {
        plot: null,
        tooltip: null
    },
    density: 1,
    padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    }
} as unknown as AxesContext;

export const axesContext = createContext<AxesContext & {
    dispatch: React.Dispatch<AxesContext>
    // @ts-ignore (init with null)
}>(null);

export function AxesReal(
    props: AxesProps
) {
    const [context, dispatch] = useReducer<
        React.Reducer<AxesContext, AxesContext>,
        AxesContext
    >(
        (_: AxesContext, newState: AxesContext) => {
            return newState;
        }, {
            ...contextInit,
            axis: {
                ...contextInit.axis,
                x: {
                    ...contextInit.axis.x,
                    data: props.xAxisData
                },
            },
            padding: {
                ...contextInit.padding,
                ...props.padding
            },
            size: props.size
        }, (_: AxesContext) => { return _; }
    );

    const plotRef = useRef<HTMLCanvasElement>(null),
        tooltipRef = useRef<HTMLCanvasElement>(null);

    const [state, setState] = useState({
        position: props.position,
        drag: false,
        mousePos: {
            x: 0,
            y: 0
        }
    });

    const axisSize = {
        x: props.xAxis ? axisSize_.height : 0,
        y: props.yAxis ? axisSize_.width : 0
    };

    function mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect();
        const x = event.clientX - window.left,
            y = event.clientY - window.top;
        // if (state.drag)
        //     this.state.axes.x.reTranslate(
        //         x - state.mousePos.x,
        //         () => { this.showTooltips(x, y, this.plot) }
        //     );
        // else
        //     this.showTooltips(x, y);
    }

    function mouseOutHandler(_: React.MouseEvent) {
        // hideTooltips();
    }

    function mouseDownHandler(event: React.MouseEvent) {
        setState({
            ...state,
            drag: true,
            mousePos: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        });
    }

    function mouseUpHandler(_: React.MouseEvent) {
        setState({
            ...state,
            drag: false
        });
    }

    function localize(range: DataRange) {
        const drawingLocal = Object.values(context.drawings).map(
            drawing => drawing.localize(range)
        );

        const yLocal = context.axis.y.transform(drawingLocal);
    }

    useEffect(() => {
        // plotRef.current?.addEventListener( // No page scrolling
        //     // @ts-ignore
        //     'wheel', wheelHandler, { passive: false }
        // );

        const x = context.axis.x.init();
        const y = context.axis.y.init();
        // console.log(x, y);
        // TODO: put handlers to context

        dispatch({
            ...context,
            ctx: {
                plot: plotRef.current?.getContext('2d') as
                    CanvasRenderingContext2D,
                tooltip: tooltipRef.current?.getContext('2d') as
                    CanvasRenderingContext2D
            }
        });
    }, []);

    // console.log(context);

    return <div
            className={'axesGrid'}
            style={{
                width: context.size.width + axisSize.y,
                height: context.size.height + axisSize.x,
                gridRowStart: state.position.row.start,
                gridRowEnd: state.position.row.end,
                gridColumnStart: state.position.column.start,
                gridColumnEnd: state.position.column.end
            }}
        >
            <div className={'axes tooltips'}>
                {context.tooltips}
            </div>
            <canvas
                ref={plotRef}
                className={'axes plot scale'}
                style={{
                    width: context.size.width,
                    height: context.size.height
                }}
                width={context.size.width}
                height={context.size.height}
            ></canvas>
            <canvas
                ref={tooltipRef}
                className={'axes plot tooltip'}
                style={{
                    width: context.size.width,
                    height: context.size.height
                }}
                width={context.size.width}
                height={context.size.height}
                onMouseMove={mouseMoveHandler}
                onMouseOut={mouseOutHandler}
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
            ></canvas>
            <axesContext.Provider value={{
                ...context,
                dispatch
            }}>
                {props.children}
                <XAxisGeometrical visible={props.xAxis} />
                <YAxis visible={props.yAxis} />
                {/*{this.settings}*/}
            </axesContext.Provider>;
        </div>;
}
