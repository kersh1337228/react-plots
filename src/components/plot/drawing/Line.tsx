import { PlotData } from '../../../utils/types/plotData';
import Drawing, { DrawingProps } from './base';

export declare type LineGeometryT = Path2D;

export declare type LineStyleT = {
    color: string
    width: number
};

class LineState<
    DataT extends PlotData
> extends Drawing<DataT, LineGeometryT, LineStyleT> {
    public constructor(
        data: DataT[],
        name: string,
        style: LineStyleT = { color: '#000000', width: 1 },
        vfield?: string
    ) {
        super(
            data,
            new Path2D(),
            name,
            style,
            vfield
        );
        const line = new Path2D();
        const i0 = [...Array(this.data.size).keys()].findIndex(
            i => this.data.pointAt(i)[1] !== null);
        line.moveTo(...this.data.pointAt(i0) as [number, number])
        data.slice(i0).forEach((_, i) => {
            const [x, y] = this.data.pointAt(i0 + i)
            if (y) { line.lineTo(x, y) }
        })
        this.geometry.addPath(line);
    }

    public override async plot(
        ctx: CanvasRenderingContext2D
    ) {
        if (this.visible) {
            ctx.save();
            ctx.lineWidth = this.style.width;
            ctx.strokeStyle = this.style.color;
            // TODO: transform coordinates
            // ctx.stroke(this.axes.applyTransform(this.paths))
            ctx.restore();
        }
    }

    public async drawTooltip(
        ctx: CanvasRenderingContext2D,
        globalX: number,
        xs: number,
        xt: number,
        ys: number,
        yt: number,
        density: number
    ) {
        const [xi, yi] = this.data.pointAt(globalX);
        if (yi) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(xi * xs + xt,
                yi * ys + yt,
                3 * density,
                0,
                2 * Math.PI);
            ctx.fillStyle = this.style.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    public override showStyle() {
        return <div key={this.name}>
            <label htmlFor={'visible'}>{this.name}</label>
            <input
                type={'checkbox'} name={'visible'}
                onChange={event => {
                    this.visible = event.target.checked;
                    // this.axes.plot()
                }} defaultChecked={this.visible}
            />
            <ul>
                <li>
                    Line color: <input
                    defaultValue={this.style.color}
                    onChange={event => {
                        this.style.color = event.target.value;
                        // this.axes.plot()
                    }} type={'color'}/>
                </li>
                <li>
                    Line width: <input
                    type={'number'} min={1} max={3} step={1}
                    defaultValue={this.style.width}
                    onChange={event => {
                        this.style.width = event.target.valueAsNumber;
                        // this.axes.plot() // TODO: replot with useEffect
                    }}/>
                </li>
            </ul>
        </div>;
    }
}

export default function Line(
    {
        data,
        name = '',
        style
    }: DrawingProps<LineStyleT>
) {
    const descriptor = new LineState(data, name, style);
}
