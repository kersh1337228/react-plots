import { PlotData } from '../../../utils/types/plotData';
import Drawing, { DrawingProps } from './base';
import React from 'react';

export declare type HistGeometryT = {
    pos: Path2D;
    neg: Path2D;
};

export declare type HistStyleT = {
    color: {
        pos: string;
        neg: string;
    };
};

class HistState<
    DataT extends PlotData
> extends Drawing<DataT, HistGeometryT, HistStyleT> {
    public constructor(
        data: DataT[],
        name: string,
        style: HistStyleT = { color: { pos: '#53e9b5', neg: '#da2c4d' } },
        vfield?: string
    ) {
        super(
            data,
            { pos: new Path2D(), neg: new Path2D() },
            name,
            style,
            vfield
        );
        const columnWidth = 0.9;
        this.data.global.data.forEach((_, i) => {
            const [x, y] = this.data.pointAt(i);
            if (y) {
                const column = new Path2D();
                column.rect(x - columnWidth  / 2, 0, columnWidth , y);
                const type = y > 0 ? 'pos' : 'neg';
                this.geometry[type].addPath(column);
            }
        })
    }

    public override async plot(
        ctx: CanvasRenderingContext2D
    ) {
        if (this.visible) {
            ctx.save()
            ctx.fillStyle = this.style.color.neg
            // ctx.fill(this.axes.applyTransform(this.paths.neg))
            ctx.fillStyle = this.style.color.pos
            // ctx.fill(this.axes.applyTransform(this.paths.pos))
            ctx.restore()
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
        // TODO: empty
    }

    public showStyle(): React.ReactElement {
        return (
            <div key={this.name}>
                <label htmlFor={'visible'}>{this.name}</label>
                <input type={'checkbox'} name={'visible'}
                       onChange={async (event) => {
                           this.visible = event.target.checked
                           // this.axes.plot()
                       }} defaultChecked={this.visible}
                />
                <ul>
                    <li>Positive color: <input
                        type={'color'} defaultValue={this.style.color.pos}
                        onChange={async (event) => {
                            this.style.color.pos = event.target.value
                            // this.axes.plot()
                        }}
                    /></li>
                    <li>Negative color: <input
                        type={'color'} defaultValue={this.style.color.neg}
                        onChange={async (event) => {
                            this.style.color.neg = event.target.value
                            // this.axes.plot()
                        }}
                    /></li>
                </ul>
            </div>
        )
    }
}

export default function Hist(
    {
        data,
        name = '',
        style
    }: DrawingProps<HistStyleT>
) {
    const descriptor = new HistState(data, name, style);
}
