import {
    AxesPlaceholderProps,
    AxesReal
} from '../axes/Axes';
import {
    Children,
    useMemo, useState
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
import drawingModule from '../drawing/index';
import { DrawingProps } from '../drawing/Drawing';

declare type FigureProps = {
    width: number;
    height: number;
    name: string;
    children: React.ReactElement<
        AxesPlaceholderProps
        // | AxesGroupPlaceholderProps
    > | React.ReactElement<
        AxesPlaceholderProps
        // | AxesGroupPlaceholderProps
    >[];
};

declare type FigureState = {}; // TODO: Figure state

export default function Figure(
    props: FigureProps
) {
    const [_, setState] = useState({}),
        rerender = () => { setState({}); }

    const children = useMemo(() => {
        const grid = {
            rows: Math.max.apply(null, Children.map(
                props.children, child => child.props.position.row.end)),
            columns: Math.max.apply(null, Children.map(
                props.children, child => child.props.position.column.end)),
        };
        const cellWidth = props.width / grid.columns,
            cellHeight = props.height / grid.rows;

        return Children.map(props.children, child => {
            const drawingsArray = Children.map(child.props.children, d => d) as
                React.ReactElement<DrawingProps<any>>[];

            // @ts-ignore
            if (child.type.name === 'Axes') {
                let xAxisData: NumberRange | DateTimeRange;
                let xAxisLabels: number[] | string[];
                const dType = plotDataTypeVectorised(drawingsArray);
                if (drawingsArray.length) {
                    if (dType)
                        if (dType === 'Geometrical') {
                            xAxisData = plotNumberRange(drawingsArray);
                            xAxisLabels = [...xAxisData];
                        } else {
                            xAxisData = plotDateTimeRange(drawingsArray);
                            xAxisLabels = [...xAxisData.format('%Y-%m-%d')];
                        }
                    else
                        throw Error("<Axes> drawings must have uniform data type.");
                } else
                    throw Error("<Axes> must contain at least one drawing.");

                const drawings = drawingsArray.map(drawing => {
                    if (!drawing.props.data.length)
                        throw Error('Drawing data can not be empty.');
                    // @ts-ignore
                    return new (drawingModule[`${drawing.type.name}Real`])(
                        fillData(drawing.props.data, xAxisLabels),
                        drawing.props.name,
                        drawing.props.style,
                        drawing.props.vfield
                    );
                    // @ts-ignore
                }) as Drawing[];

                return new AxesReal(
                    rerender,
                    drawings,
                    child.props.position,
                    child.props.name,
                    {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        ...child.props.padding
                    },
                    {
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
                    xAxisData,
                    child.props.xAxis ?? true,
                    child.props.yAxis ?? true,
                );
                // } else if (child.type.name === 'AxesGroup')
                //     return React.createElement(AxesGroupReal, childProps)
            }
            else
                throw Error("Only <Axes> and <AxesGroup> can appear as <Figure> children.")
        });
    }, []);

    return <div
        className={'figureGrid'}
        style={{
            width: props.width,
            height: props.height
        }}
    >
        {/*<FigureSettings />*/}
        {children.map(child => <child.render key={child.name} />)}
    </div>
}
