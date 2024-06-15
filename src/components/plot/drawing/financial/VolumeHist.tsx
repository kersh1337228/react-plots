import React from 'react';
import Drawing, {
    DrawingProps
} from '../base/Drawing';
import {
    Quotes
} from '../../../../utils/types/plotData';
import {
    HistGeometry,
    HistStyle
} from '../base/Hist';
import VolumeData from './data/volume';

export default function VolumeHist(_: DrawingProps<HistStyle>) {
    return null;
}

export class VolumeHistReal extends Drawing<
    HistGeometry,
    HistStyle
> {
    public constructor(
        data: Quotes[],
        name: string,
        style: HistStyle = {
            color: {
                pos: '#53e9b5',
                neg: '#da2c4d'
            },
        }
    ) {
        super(
            data,
            name,
            {
                pos: new Path2D(),
                neg: new Path2D()
            },
            style,
            'volume',
            VolumeData
        );

        for (let i = 0; i < data.length; ++i) {
            const {
                open,
                close,
                volume
            } = data[i];
            if (volume !== null) {
                const column = new Path2D();
                column.rect(
                    i + 0.05,
                    0,
                    1,
                    volume
                );

                const type = (close as number) < (open as number) ? 'neg' : 'pos';
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
