import {
    AxesComponent,
    AxesContext,
    AxesReal
} from '../axes/Axes';
import {
    AxesGroupContext
} from '../axesGroup/AxesGroup';
import {
    cloneElement,
    createContext,
    createElement,
    useReducer,
    Children
} from 'react';
import {
    axisSize_
} from '../../../utils_refactor/constants/plot';
import NumberRange, {
    plotNumberRange
} from '../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange, {
    plotDateTimeRange
} from '../../../utils_refactor/classes/iterable/DateTimeRange';
import {
    fillData,
    plotDataTypeVectorised
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    Geometrical,
    TimeSeries
} from '../../../utils_refactor/types/plotData';
import {
    AxesGroupComponent
} from '../axesGroup/AxesGroup';
import { DrawingComponent } from '../drawing/Drawing';

declare type FigureProps = {
    width: number;
    height: number;
    name: string;
    children: (AxesComponent | AxesGroupComponent)
        | (AxesComponent | AxesGroupComponent)[];
};

declare type FigureState = {

};

declare type FigureContext = {
    children: {
        [name: string]: AxesContext | AxesGroupContext
    };
};

const figureContextInit = {
    children: {},
    dispatch: () => {}
};

export const FigureContext = createContext<
    FigureContext & {
        dispatch: React.Dispatch<FigureContext>
    }
>(figureContextInit);

export default function Figure(
    props: FigureProps
) {
    const grid = {
        rows: Math.max.apply(null, Children.map(
            props.children, child => child.props.position.row.end)),
        columns: Math.max.apply(null, Children.map(
            props.children, child => child.props.position.column.end)),
    };
    const cellWidth = props.width / grid.columns,
        cellHeight = props.height / grid.rows;

    const childrenModified = Children.map(props.children, (child, index) => {
        const childProps = {
            ...child.props,
            xAxis: child.props.xAxis ?? true,
            yAxis: child.props.yAxis ?? true,
            padding: child.props.padding ?? {
                left: 0, top: 0, right: 0, bottom: 0, ...child.props.padding
            },
            size: {
                width: (
                    child.props.position.column.end -
                    child.props.position.column.start
                ) * cellWidth - (
                    child.props.yAxis === false ? 0 : axisSize_.width
                ),
                height: (
                    child.props.position.row.end -
                    child.props.position.row.start
                ) * cellHeight - (
                    child.props.xAxis === false ? 0 : axisSize_.height
                )
            },
            key: index
        }
        if (child.type.name === 'Axes') {
            let xAxisData: NumberRange | DateTimeRange;
            let xAxisLabels: number[] | string[];
            const dType = plotDataTypeVectorised(child.props.children);
            if (child.props.children.length) {
                if (dType)
                    if (dType === 'Geometrical') {
                        xAxisData = plotNumberRange(child.props.children);
                        xAxisLabels = [...xAxisData];
                    } else {
                        xAxisData = plotDateTimeRange(child.props.children);
                        xAxisLabels = [...xAxisData.format('%Y-%m-%d')];
                    }
                else
                    throw Error("<Axes> drawings must have uniform data type.")
            } else
                throw Error("<Axes> must contain at least one drawing.")
            const drawings = (child.props.children as DrawingComponent[]).map(drawing => {
                if (!drawing.props.data.length)
                    throw Error('Drawing data can not be empty.');
                return cloneElement(drawing, {
                    ...drawing.props,
                    data: fillData(drawing.props.data, xAxisLabels),
                    key: drawing.props.name
                });
            })
            return createElement(AxesReal, { key: childProps.name, ...childProps, xAxisData }, drawings)
            // } else if (child.type.name === 'AxesGroup')
            //     return React.createElement(AxesGroupReal, childProps)
        }
        else
            throw Error("Only <Axes> and <AxesGroup> can appear as <Figure> children.")
    });

    const [figureContext, dispatch] = useReducer(
        (_: FigureContext, newState: FigureContext) => {
            return newState;
        },
        figureContextInit
    );

    return <FigureContext.Provider value={{
        ...figureContext,
        dispatch
    }}>
        {/*<FigureSettings />*/}
        <div
            className={'figureGrid'}
            style={{
                width: props.width,
                height: props.height
            }}
        >
            {childrenModified}
        </div>
    </FigureContext.Provider>
}
