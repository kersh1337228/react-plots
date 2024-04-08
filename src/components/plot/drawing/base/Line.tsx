import Drawing, {
    DrawingProps
} from './Drawing';
import {
    PlotData
} from '../../../../utils/types/plotData';

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
        vField?: string
    ) {
        super(data, name, new Path2D(), style, vField);

        const i0 = [...Array(data.length).keys()].findIndex(
            i => this.data.point(i)[1] !== null);
        this.geometry.moveTo(
            ...this.data.point(i0) as [number, number]);
        for (let i = i0; i < data.length; ++i) {
            const [x, y] = this.data.point(i);
            if (y != null)
                this.geometry.lineTo(x, y);
        }
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
        const [xi, yi] = this.data.point(
            this.data.globalize(localX));
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
        return super.settings(<>
            <colgroup>
                <col span={1} width={128}/>
                <col span={1} width={32}/>
            </colgroup>
            <tbody>
                <tr>
                    <td>
                        Line color:
                    </td>
                    <td>
                        <input
                            type={'color'}
                            defaultValue={this.style.color}
                            onChange={event => {
                                this.style.color = event.target.value;
                                this.axes.draw();
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        Line width:
                    </td>
                    <td>
                        <input
                            type={'number'}
                            min={1} max={3} step={1}
                            defaultValue={this.style.width}
                            onChange={event => {
                                this.style.width = event.target.valueAsNumber;
                                this.axes.draw();
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </>);
    }
}
