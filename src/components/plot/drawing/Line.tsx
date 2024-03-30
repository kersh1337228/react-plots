import {
    PlotData
} from '../../../utils_refactor/types/plotData';
import {
    DrawingProps,
    useDrawing
} from './Drawing';
import {
    useContext,
    useMemo
} from 'react';
import {
    axesContext
} from '../axes/Axes';

export declare type LineStyleT = {
    color: string
    width: number
};

function useLine<
    DataT extends PlotData
> (
    data: DataT[],
    style: LineStyleT = {
        color: '#000000',
        width: 1
    },
    name: string,
    vfield?: string
) {
    const drawing = useDrawing(
        data,
        style,
        name,
        vfield
    );

    const geometry = useMemo(() => {
        const line = new Path2D();
        const i0 = [...Array(data.length).keys()].findIndex(
            i => drawing.pointAt(i)[1] !== null);
        line.moveTo(...drawing.pointAt(i0) as [number, number]);
        data.slice(i0).forEach((_, i) => {
            const [x, y] = drawing.pointAt(i0 + i);
            if (y)
                line.lineTo(x, y);
        })
        return line;
    }, [drawing.state.style.width]);

    const {
        ctx: {
            plot: ctx
        },
        transformMatrix,
        density
    } = useContext(axesContext);

    async function plot() {
        if (drawing.state.visible && ctx) {
            ctx.save();

            ctx.lineWidth = drawing.state.style.width;
            ctx.strokeStyle = drawing.state.style.color;
            let temp = new Path2D();
            temp.addPath(geometry, transformMatrix);
            ctx.stroke(temp);

            ctx.restore();
        }
    }

    async function drawTooltip(
        globalX: number
    ) {
        const [xi, yi] = drawing.pointAt(globalX);
        if (yi && ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(xi * transformMatrix.a + transformMatrix.e,
                yi * transformMatrix.d + transformMatrix.f,
                3 * density,
                0,
                2 * Math.PI);
            ctx.fillStyle = drawing.state.style.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    function showStyle() {
        return <div key={name}>
            <label htmlFor={'visible'}>{name}</label>
            <input
                type={'checkbox'}
                name={'visible'}
                onChange={async (event) => {
                    drawing.setState({
                        ...drawing.state,
                        visible: event.target.checked
                    });
                    // this.axes.plot() // TODO: full replot
                }} defaultChecked={drawing.state.visible}
            />
            <ul>
                <li>
                    Line color: <input
                    type={'color'}
                    defaultValue={drawing.state.style.color}
                    onChange={async (event) => {
                        drawing.setState({
                            ...drawing.state,
                            style: {
                                ...drawing.state.style,
                                color: event.target.value
                            }
                        });
                        // this.axes.plot()
                    }}
                /></li>
                <li>
                    Line width: <input
                    type={'number'}
                    min={1} max={3} step={1}
                    defaultValue={drawing.state.style.width}
                    onChange={event => {
                        drawing.setState({
                            ...drawing.state,
                            style: {
                                ...drawing.state.style,
                                width: event.target.valueAsNumber
                            }
                        });
                        // this.axes.plot()
                    }}/>
                </li>
            </ul>
        </div>;
    }

    return {
        ...drawing,
        geometry,
        plot,
        drawTooltip,
        showStyle
    };
}

export default function Line(
    props: DrawingProps<LineStyleT>
) {
    const line = useLine(props.data, props.style, props.name, props.vfield);
    // TODO: add effects

    return null;
}
