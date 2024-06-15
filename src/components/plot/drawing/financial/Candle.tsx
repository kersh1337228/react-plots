import React from 'react';
import Drawing, {
    DrawingProps
} from '../base/Drawing';
import {
    Quotes
} from '../../../../utils/types/plotData';
import QuotesData from './data/quotes';

export type CandleStyle = {
    color: {
        pos: string;
        neg: string;
    };
    width: number;
};

export default function Candle(_: DrawingProps<CandleStyle>) {
    return null;
}

type CandleGeometry = {
    wick: {
        pos: Path2D;
        neg: Path2D;
    };
    body: {
        pos: Path2D;
        neg: Path2D;
    };
};

export class CandleReal extends Drawing<
    CandleGeometry,
    CandleStyle
> {
    public constructor(
        data: Quotes[],
        name: string,
        style: CandleStyle = {
            color: {
                pos: '#53e9b5',
                neg: '#da2c4d'
            },
            width: 1
        },
    ) {
        super(data, name, {
            wick: {
                pos: new Path2D(),
                neg: new Path2D()
            },
            body: {
                pos: new Path2D(),
                neg: new Path2D()
            }
        }, style, '', QuotesData);

        for (let i = 0; i < data.length; ++i) {
            const {
                open,
                high,
                low,
                close
            } = data[i];
            if (close !== null) {
                const wick = new Path2D();
                wick.moveTo(i + 0.55, low as number);
                wick.lineTo(i + 0.55, high as number);
                wick.closePath();

                const body = new Path2D();
                body.rect(
                    i + 0.05,
                    open as number,
                    1,
                    close - (open as number)
                );

                const type = close > (open as number) ? 'pos' : 'neg';
                this.geometry.wick[type].addPath(wick);
                this.geometry.body[type].addPath(body);
            }
        }
    }

    public override draw() {
        const ctx = this.axes.ctx.main as CanvasRenderingContext2D;
        if (this.visible) {
            ctx.save();

            ctx.fillStyle = this.style.color.neg;
            let temp = new Path2D();
            temp.addPath(this.geometry.body.neg, this.axes.transformMatrix);
            ctx.fill(temp);

            ctx.fillStyle = this.style.color.pos;
            temp = new Path2D();
            temp.addPath(this.geometry.body.pos, this.axes.transformMatrix);
            ctx.fill(temp);

            ctx.lineWidth = this.style.width;
            ctx.strokeStyle = this.style.color.neg;
            temp = new Path2D();
            temp.addPath(this.geometry.wick.neg, this.axes.transformMatrix);
            ctx.stroke(temp);

            ctx.strokeStyle = this.style.color.pos;
            temp = new Path2D();
            temp.addPath(this.geometry.wick.pos, this.axes.transformMatrix);
            ctx.stroke(temp);

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
            <tr>
                <td>
                    Wick width:
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
