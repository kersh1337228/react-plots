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

declare type LineStyle = {
    color: string
    width: number
};

export default function Line(
    props: DrawingProps<LineStyle>
) {
    const drawing = useDrawing(props.data, props.name);

    const geometry = useMemo(() => {
        const line = new Path2D();
        const i0 = [...Array(props.data.length).keys()].findIndex(
            i => drawing.pointAt(i)[1] !== null);
        line.moveTo(...drawing.pointAt(i0) as [number, number]);
        props.data.slice(i0).forEach((_, i) => {
            const [x, y] = drawing.pointAt(i0 + i);
            if (y)
                line.lineTo(x, y);
        })
        return line;
    }, [drawing.style.width]);

    const {
        ctx: {
            plot: ctx
        },
        transformMatrix,
        density
    } = useContext(axesContext);

    async function plot() {
        if (drawing.visible && ctx) {
            ctx.save();

            ctx.lineWidth = drawing.style.width;
            ctx.strokeStyle = drawing.style.color;
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
            ctx.fillStyle = drawing.style.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    function showStyle() {
        return <div key={props.name}>
            <label htmlFor={'visible'}>{props.name}</label>
            <input
                type={'checkbox'}
                name={'visible'}
                onChange={async (event) => {
                    drawing.dispatch((context) => {
                        context.drawings[props.name].visible = event.target.checked;
                        return context;
                    });
                    // this.axes.plot() // TODO: full replot
                }} defaultChecked={drawing.visible}
            />
            <ul>
                <li>
                    Line color: <input
                    type={'color'}
                    defaultValue={drawing.style.color}
                    onChange={async (event) => {
                        drawing.dispatch((context) => {
                            (context.drawings[props.name].style as LineStyle)
                                .color = event.target.value;
                            return context;
                        });
                        // this.axes.plot()
                    }}
                /></li>
                <li>
                    Line width: <input
                    type={'number'}
                    min={1} max={3} step={1}
                    defaultValue={drawing.style.width}
                    onChange={event => {
                        drawing.dispatch((context) => {
                            (context.drawings[props.name].style as LineStyle)
                                .width = event.target.valueAsNumber;
                            return context;
                        });
                        // this.axes.plot()
                    }}/>
                </li>
            </ul>
        </div>;
    }

    return null;
}
