import Drawing, {
    DrawingProps
} from './Drawing';
import {
    PlotData
} from '../../../utils_refactor/types/plotData';

export declare type HistStyle = {
    color: {
        pos: string;
        neg: string;
    };
    width: number
};

export default function Hist(_: DrawingProps<HistStyle>) {
    return null;
}

declare type HistGeometry = {
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
            width: 0.9
        },
        vfield?: string
    ) {
        super(data, name, {
            pos: new Path2D(),
            neg: new Path2D()
        }, style, vfield);
        data.forEach((_, i) => {
            const [x, y] = this.point(i);
            if (y) {
                const column = new Path2D();
                column.rect(
                    x - this.style.width / 2, 0,
                    this.style.width, y
                );
                const type = y > 0 ? 'pos' : 'neg';
                this.geometry[type].addPath(column);
            }
        });
    }

    public override draw() {
        const ctx = this.axes.ctx.main;
        if (this.visible && ctx) {
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

    public override drawTooltip(_: number) {
        // TODO: empty
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
                }}
                defaultChecked={this.visible}
            />
            <ul>
                <li>Positive color: <input
                    type={'color'}
                    defaultValue={this.style.color.pos}
                    onChange={event => {
                        this.style.color.pos = event.target.value;
                        // this.axes.plot()
                    }}
                /></li>
                <li>Negative color: <input
                    type={'color'}
                    defaultValue={this.style.color.neg}
                    onChange={event => {
                        this.style.color.neg = event.target.value;
                        // this.axes.plot()
                    }}
                /></li>
            </ul>
        </div>;
    }
}
