import {
    DrawingProps,
    useDrawing
} from './Drawing';
import React, {
    useMemo
} from 'react';

export declare type HistStyle = {
    color: {
        pos: string;
        neg: string;
    };
    width: number
};

export default function Hist(
    {
        data,
        name,
        style = {
            color: {
                pos: '#53e9b5',
                neg: '#da2c4d'
            },
            width: 0.9
        },
        vfield
    }: DrawingProps<HistStyle>
) {
    const drawing = useDrawing({ data, name, style, vfield });

    const geometry = useMemo(() => {
        const hist = {
            pos: new Path2D(),
            neg: new Path2D()
        };
        data.forEach((_, i) => {
            const [x, y] = drawing.pointAt(i);
            if (y) {
                const column = new Path2D();
                column.rect(
                    x - drawing.style.width / 2, 0,
                    drawing.style.width, y
                );
                const type = y > 0 ? 'pos' : 'neg';
                hist[type].addPath(column);
            }
        });
        return hist;
    }, [drawing.style.width]);

    function plot() {
        const ctx = drawing.context.ctx.plot;
        if (drawing.visible && ctx) {
            ctx.save();

            ctx.fillStyle = drawing.style.color.neg;
            let temp = new Path2D();
            temp.addPath(geometry.neg, drawing.context.transformMatrix);
            ctx.fill(temp);

            ctx.fillStyle = drawing.style.color.pos
            temp = new Path2D();
            temp.addPath(geometry.pos, drawing.context.transformMatrix);
            ctx.fill(temp);

            ctx.restore()
        }
    }

    function drawTooltip(
        globalX: number
    ) {
        // TODO: empty
    }

    function showStyle() {
        return (
            <div key={name}>
                <label htmlFor={'visible'}>{name}</label>
                <input
                    type={'checkbox'}
                    name={'visible'}
                    onChange={async (event) => {
                        drawing.dispatch((context) => {
                            context.drawings[name].visible = event.target.checked;
                            return context;
                        });
                        // this.axes.plot() // TODO: full replot
                    }}
                    defaultChecked={drawing.visible}
                />
                <ul>
                    <li>Positive color: <input
                        type={'color'}
                        defaultValue={drawing.style.color.pos}
                        onChange={async (event) => {
                            drawing.dispatch((context) => {
                                context.drawings[name].style.pos = event.target.value;
                                return context;
                            });
                            // this.axes.plot()
                        }}
                    /></li>
                    <li>Negative color: <input
                        type={'color'}
                        defaultValue={drawing.style.color.neg}
                        onChange={async (event) => {
                            drawing.dispatch((context) => {
                                context.drawings[name].style.neg = event.target.value;
                                return context;
                            });
                            // this.axes.plot()
                        }}
                    /></li>
                </ul>
            </div>
        )
    }

    return null;
})
