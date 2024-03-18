import React, { useRef, useState } from 'react';
import Drawing from '../drawings/Drawing/Drawing';
import { PlotData } from '../../../utils/types/plotData';
import { DataRange, GridPosition, Padding2D, Size2D } from '../../../utils/types/display';
import NumberRange from '../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../utils/classes/iterable/DateTimeRange';
import { axisSize_ } from '../../../utils/constants/plot';
import Figure from '../figure/Figure';
import AxesSettings from './settings/AxesSettings';
import { Callback } from '../../../utils/types/callable';

interface AxesPlaceholderProps {
    drawings: Drawing<PlotData, any, any>[]
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    padding?: Padding2D
    title: string
}

export default function Axes(_: AxesPlaceholderProps) {}

interface AxesProps extends AxesPlaceholderProps {
    size: Size2D
    xAxisData: NumberRange | DateTimeRange
    dataRange?: DataRange,
    tooltips?: { x: number, y: number }
}

export function Axes_(props: AxesProps) {
    const [drawings, setDrawings] = useState(() => {
        return props.drawings.map(drawing => {
            return drawing;
        });
    });
    const [dataRange, setDataRange] = useState({ start: 0, end: 1 });
    const [dataAmount, setDataAmount] = useState(props.xAxisData.length);
    const [transformMatrix, setTransformMatrix] = useState(new DOMMatrix([ 1, 0, 0, 1, 0, 0 ]));

    const plotRef = useRef<HTMLCanvasElement>();
    const [plotDensity, setPlotDensity] = useState(1);
    const tooltipRef = useRef<HTMLCanvasElement>();
    const [drag, setDrag] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // TODO: Axis
    // const [xAxis, setXAxis] = useState();
    // const [yAxis, setYAxis] = useState();

    const [tooltips, setTooltips] = useState<React.ReactNode>(null);
    const [position, setPosition] = useState(props.position);
    const [size, setSize] = useState(props.size);

    const offset = useRef(0);
    const axisSize = {
        x: props.xAxis ? axisSize_.height : 0,
        y: props.yAxis ? axisSize_.width : 0
    };
    // TODO: settings
    // const settings = this.props.parent instanceof Figure ? <AxesSettings axes={this}/> : null

    function setWindow(callback?: Callback) {
        if (plotRef.current && tooltipRef.current) {
            plotRef.current.width = size.width;
            plotRef.current.height = size.height;
            tooltipRef.current.width = size.width;
            tooltipRef.current.height = size.height;
        }
        // xAxis.setWindow();
        // yAxis.setWindow();
        // this.setState(state, callback)
    }
}
