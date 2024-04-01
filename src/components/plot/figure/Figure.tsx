import {
    AxesPlaceholderProps,
    AxesReal
} from '../axes/single/Axes';
import {
    Children, JSXElementConstructor,
    useMemo, useState
} from 'react';
import NumberRange from '../../../utils_refactor/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils_refactor/classes/iterable/DateTimeRange';
import {
    fillData,
    plotDataTypeVectorised
} from '../../../utils_refactor/functions/plotDataProcessing';
import {
    DrawingProps
} from '../drawing/Drawing';
import {
    AxesGroupPlaceholderProps,
    AxesGroupReal
} from '../axes/group/AxesGroup';
import drawingModule from '../drawing/index';
import './Figure.css';

declare type FigureProps = {
    width: number;
    height: number;
    name: string;
    children: React.ReactElement<
        AxesPlaceholderProps
        | AxesGroupPlaceholderProps
    > | React.ReactElement<
        AxesPlaceholderProps
        | AxesGroupPlaceholderProps
    >[];
};

declare type FigureState = {}; // TODO: Figure state

export default function Figure(
    props: FigureProps
) {
    const [_, setState] = useState({}),
        rerender = () => { setState({}); }

    const children = useMemo(() => {
        const rows = Math.max.apply(null, Children.map(props.children,
                    child => child.props.position.row.end)) - 1,
            columns = Math.max.apply(null, Children.map(props.children,
                    child => child.props.position.column.end)) - 1;
        const cellWidth = props.width / columns,
            cellHeight = props.height / rows;

        return Children.map(props.children, child => {
            const size = {
                width: (
                    child.props.position.column.end -
                    child.props.position.column.start
                ) * cellWidth,
                height: (
                    child.props.position.row.end -
                    child.props.position.row.start
                ) * cellHeight
            };

            const drawingsArray = Children.map(child.props.children, d => d) as
                React.ReactElement<DrawingProps<any>>[];

            if ((child.type as JSXElementConstructor<any>).name === 'Axes') {
                let xAxisData: NumberRange | DateTimeRange,
                    xAxisLabels: number[] | string[];
                const dtype = plotDataTypeVectorised(drawingsArray);
                if (drawingsArray.length) {
                    if (dtype)
                        if (dtype === 'Numeric') {
                            xAxisData = NumberRange.plotNumberRange(drawingsArray);
                            xAxisLabels = [...xAxisData];
                        } else {
                            xAxisData = DateTimeRange.plotDateTimeRange(drawingsArray);
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
                });

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
                        ...(child.props as AxesPlaceholderProps).padding
                    },
                    size,
                    xAxisData,
                    child.props.xAxis ?? true,
                    (child.props as AxesPlaceholderProps).yAxis ?? true,
                );
            } else if ((child.type as JSXElementConstructor<any>).name === 'AxesGroup')
                return new AxesGroupReal(
                    rerender,
                    child.props.children as
                        React.ReactElement<AxesPlaceholderProps>
                        | React.ReactElement<AxesPlaceholderProps>[],
                    child.props.position,
                    child.props.name,
                    size,
                    child.props.xAxis ?? true
                );
            else
                throw Error("Only <Axes> and <AxesGroup> are allowed to be <Figure> children.")
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
