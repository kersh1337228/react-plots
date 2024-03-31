import Drawing, {
    DrawingProps
} from './Drawing';
import {
    PlotData
} from '../../../utils_refactor/types/plotData';

declare type LineStyle = {
    color: string
    width: number
};

export default function Line(_: DrawingProps<LineStyle>) {
    return null;
}

export class LineReal extends Drawing<
    Path2D,
    LineStyle
> {
    public constructor(
        data: PlotData[],
        name: string,
        style: LineStyle = {
            color: '#000000',
            width: 1
        },
        vfield?: string
    ) {
        super(data, name, new Path2D(), style, vfield);
        const i0 = [...Array(data.length).keys()].findIndex(
            i => this.point(i)[1] !== null);
        this.geometry.moveTo(...this.point(i0) as [number, number]);
        data.slice(i0).forEach((_, i) => {
            const [x, y] = this.point(i0 + i);
            if (y != null)
                this.geometry.lineTo(x, y);
        });
    }

    public override draw() {
        const ctx = this.axes.ctx.main;
        if (this.visible && ctx) {
            ctx.save();

            ctx.lineWidth = this.style.width;
            ctx.strokeStyle = this.style.color;
            let temp = new Path2D();
            temp.addPath(this.geometry, this.axes.transformMatrix);
            ctx.stroke(temp);

            ctx.restore();
        }
    }

    public override drawTooltip(localX: number) {
        const ctx = this.axes.ctx.tooltip;
        const [xi, yi] = this.point(this.globalize(localX));
        if (yi !== null && ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                xi * this.axes.transformMatrix.a + this.axes.transformMatrix.e,
                yi * this.axes.transformMatrix.d + this.axes.transformMatrix.f,
                3 * this.axes.density,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = this.style.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    public override settings() {
        return <div key={this.name}>
            <label htmlFor={'visible'}>{this.name}</label>
            <input
                type={'checkbox'}
                name={'visible'}
                onChange={event => {
                    this.visible = event.target.checked;
                    // this.axes.plot() // TODO: full replot
                }} defaultChecked={this.visible}
            />
            <ul>
                <li>
                    Line color: <input
                    type={'color'}
                    defaultValue={this.style.color}
                    onChange={event => {
                        this.style.color = event.target.value;
                        // this.axes.plot()
                    }}
                /></li>
                <li>
                    Line width: <input
                    type={'number'}
                    min={1} max={3} step={1}
                    defaultValue={this.style.width}
                    onChange={event => {
                        this.style.width = event.target.valueAsNumber;
                        // this.axes.plot()
                    }}/>
                </li>
            </ul>
        </div>;
    }
}
