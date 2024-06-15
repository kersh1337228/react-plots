import React from 'react';
import Drawing, {
    DrawingProps
} from './Drawing';
import {
    PlotData
} from '../../../../utils/types/plotData';
import NumberRange from '../../../../utils/classes/iterable/NumberRange';
import DateTimeRange from '../../../../utils/classes/iterable/DateTimeRange';

export type HistStyle = {
    color: {
        pos: string;
        neg: string;
    };
};

export default function Hist(_: DrawingProps<HistStyle>) {
    return null;
}

export type HistGeometry = {
    pos: Path2D;
    neg: Path2D;
};

export class HistReal extends Drawing<
    HistGeometry,
    HistStyle
> {
    public constructor(
        data: PlotData[],
        name: string,
        style: HistStyle = {
            color: {
                pos: '#53e9b5',
                neg: '#da2c4d'
            },
        },
        xAxisData: NumberRange | DateTimeRange,
        vField?: string,
    ) {
        super(
            data,
            name,
            {
                pos: new Path2D(),
                neg: new Path2D()
            },
            style,
            vField
        );

        for (let i = 0; i < data.length; ++i) {
            const [x, y] = this.data.point(i);
            if (y !== null) {
                const column = new Path2D();
                column.rect(
                    x - xAxisData.step / 2,
                    0,
                    xAxisData.step,
                    y
                );
                const type = y > 0 ? 'pos' : 'neg';
                this.geometry[type].addPath(column);
            }
        }
    }

    public override draw() {
        const ctx = this.axes.ctx.main as CanvasRenderingContext2D;
        if (this.visible) {
            ctx.save();

            ctx.fillStyle = this.style.color.neg;
            let temp = new Path2D();
            temp.addPath(this.geometry.neg, this.axes.transformMatrix);
            ctx.fill(temp);

            ctx.fillStyle = this.style.color.pos;
            temp = new Path2D();
            temp.addPath(this.geometry.pos, this.axes.transformMatrix);
            ctx.fill(temp);

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
                        Positive color:
                    </td>
                    <td>
                        <input
                            type={'color'}
                            defaultValue={this.style.color.pos}
                            onChange={event => {
                                this.style.color.pos = event.target.value;
                                this.axes.draw();
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        Negative color:
                    </td>
                    <td>
                        <input
                            type={'color'}
                            defaultValue={this.style.color.neg}
                            onChange={event => {
                                this.style.color.neg = event.target.value;
                                this.axes.draw();
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </>);
    }
}
