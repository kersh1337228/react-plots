'use client';

import {
    AxesPlaceholderProps,
    AxesReal
} from '../axes/single/Axes';
import React, {
    JSXElementConstructor,
    useMemo,
    useState
} from 'react';
import NumberRange from '../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils/classes/iterable/DateTimeRange';
import {
    fillData,
    plotDataTypeVectorised,
    expandFragments
} from '../../../utils/functions/plotDataProcessing';
import {
    DrawingProps
} from '../drawing/base/Drawing';
import {
    AxesGroupPlaceholderProps,
    AxesGroupReal
} from '../axes/group/AxesGroup';
import drawingModule from '../drawing/index';
import FigureSettings from './settings/Settings';

export default function Figure(
    props: {
        width: number;
        height: number;
        name: string;
        children: any;
        settings?: boolean;
    }
) {
    const [_, setState] = useState({}),
        rerender = () => { setState({}); }

    const flat = expandFragments(props.children) as React.ReactElement<
        AxesPlaceholderProps | AxesGroupPlaceholderProps>[];

    const children = useMemo(() => {
        const rows = Math.max.apply(null,
                flat.map(child =>
                    child.props.position.row.end
                )
            ) - 1;
        const columns = Math.max.apply(null,
                flat.map(child =>
                    child.props.position.column.end
                )
            ) - 1;

        const cellWidth = props.width / columns,
            cellHeight = props.height / rows;

        return flat.map(child => {
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
            const drawingsArray = expandFragments(
                child.props.children
            ) as React.ReactElement<DrawingProps<any>>[];

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
                            xAxisLabels = [...xAxisData.format()];
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
                        xAxisData,
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
                    child.props.settings,
                    false
                );
            } else if ((child.type as JSXElementConstructor<any>).name === 'AxesGroup')
                return new AxesGroupReal(
                    rerender,
                    expandFragments(child.props.children),
                    child.props.position,
                    child.props.name,
                    size,
                    child.props.xAxis ?? true,
                    child.props.settings
                );
            else
                throw Error("Only <Axes> and <AxesGroup> are allowed to be <Figure> children.")
        });
    }, [
        props.children,
        props.width,
        props.height
    ]);

    return <div
        style={{
            width: 'max-content',
            height: 'max-content'
        }}
    >
        <FigureSettings
            name={props.name}
            children={children}
            rerender={rerender}
            visible={props.settings}
        />
        <div
            className={'figure-grid'}
            style={{
                display: 'grid',
                gridAutoRows: 'minmax(min-content, max-content)',
                gridAutoColumns: 'minmax(min-content, max-content)',
                width: props.width,
                height: props.height
            }}
        >
            {children.map(child =>
                <child.render key={child.name}/>
            )}
        </div>
    </div>
}
