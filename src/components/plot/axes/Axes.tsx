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
    createContext, useContext, useEffect,
    useReducer,
    useRef,
    useState
} from 'react';
import {
    AxisContext
} from './axis/base';
import {
    axisSize_
} from '../../../utils_refactor/constants/plot';
import YAxis from './axis/y/base';
import XAxisGeometrical from './axis/x/geometrical';
import { FigureContext } from '../figure/Figure';

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
    drag: boolean;
    mousePos: {
        x: number;
        y: number;
    }
}

export declare type AxesContext = {
    drawings: {
        [name: string]: DrawingContext;
    };
    axis: {
        x: AxisContext;
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
    position: GridPosition;
    size: Size;
}

export const axesContextInit = {
    drawings: {},
    axis: {
        x: {},
        y: {}
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
    dispatch: (
        action: (context: AxesContext) => AxesContext
    ) => void
    // @ts-ignore (init with null)
}>(null);

export function AxesReal(
    props: AxesProps
) {
    const figureContext = useContext(FigureContext),
        context = figureContext.children[props.name] as AxesContext,
        dispatch = figureContext.dispatch;

    const [state, setState] = useState<AxesState>({
        drag: false,
        mousePos: {
            x: 0,
            y: 0
        }
    });

    const plotRef = useRef<HTMLCanvasElement>(null),
        tooltipRef = useRef<HTMLCanvasElement>(null);

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
        // const drawingLocal = Object.values(context.drawings).map(
        //     drawing => drawing.localize(range)
        // );
        //
        // const yLocal = context.axis.y.transform(drawingLocal);
    }

    useEffect(() => {
        // plotRef.current?.addEventListener( // No page scrolling
        //     // @ts-ignore
        //     'wheel', wheelHandler, { passive: false }
        // );

        // console.log(x, y);
        // TODO: put handlers to context

        dispatch((context) => {
            (context.children[props.name] as AxesContext).ctx = {
                plot: plotRef.current?.getContext('2d') as
                    CanvasRenderingContext2D,
                tooltip: tooltipRef.current?.getContext('2d') as
                    CanvasRenderingContext2D
            };
            return context;
        });
    }, []);

    return <div
            className={'axesGrid'}
            style={{
                width: context.size.width + axisSize.y,
                height: context.size.height + axisSize.x,
                gridRowStart: context.position.row.start,
                gridRowEnd: context.position.row.end,
                gridColumnStart: context.position.column.start,
                gridColumnEnd: context.position.column.end
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
                dispatch: (
                    action: (context: AxesContext) => AxesContext
                ) => {
                    dispatch((figureContext) => {
                        figureContext.children[props.name] = action(context);
                        return figureContext;
                    });
                }
            }}>
                {props.children}
                <XAxisGeometrical visible={props.xAxis} />
                <YAxis visible={props.yAxis} />
                {/*{this.settings}*/}
            </axesContext.Provider>;
        </div>;
}
