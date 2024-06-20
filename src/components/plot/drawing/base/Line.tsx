import React from 'react';
import Drawing, {
    DrawingProps
} from './Drawing';
import {
    PlotData
} from '../../../../utils/types/plotData';
import NumberRange from '../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils/classes/iterable/DateTimeRange';

type LineStyle = {
    color: string;
    width: number;
};

export default function Line(_: DrawingProps<Partial<LineStyle>>) {
    return null;
}

export class LineReal extends Drawing<
    Path2D,
    LineStyle
> {
    public constructor(
        data: PlotData[],
        name: string,
        {
            color = '#000000',
            width = 1
        }: Partial<LineStyle> = {
            color: '#000000',
            width: 1
        },
        _: NumberRange | DateTimeRange,
        vField?: string
    ) {
        super(data, name, new Path2D(), { color, width }, vField);

        const points = data.map(
            (_, i) => this.data.point(i));
        const i0 = points.findIndex(
            point => point[1] !== null);
        this.geometry.moveTo(
            ...points[i0] as [number, number]);
        for (let i = i0; i < data.length; ++i) {
            const [x, y] = points[i];
            if (y != null)
                this.geometry.lineTo(x, y);
        }
    }

    public override draw() {
        const ctx = this.axes.ctx.main as CanvasRenderingContext2D;
        if (this.visible) {
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
        const ctx = this.axes.ctx.tooltip as CanvasRenderingContext2D;
        const [xi, yi] = this.data.point(
            this.data.globalize(localX));
        if (yi !== null) {
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

    public override get color() {
        return this.style.color;
    }
}
