import { PlotData } from '../../../utils_refactor/types/plotData';
import { DrawingProps, useDrawing } from './Drawing';
import React, { useContext, useMemo } from 'react';
import { axesContext } from '../axes/Axes';

export declare type HistStyleT = {
    color: {
        pos: string;
        neg: string;
    };
    width: number
};

export default function Hist(
    props: DrawingProps<HistStyleT>
) {
    const drawing = useDrawing(props.data, props.name);

    const geometry = useMemo(() => {
        const hist = {
            pos: new Path2D(),
            neg: new Path2D()
        };
        props.data.forEach((_, i) => {
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

    const {
        ctx: {
            plot: ctx
        },
        transformMatrix
    } = useContext(axesContext);

    async function plot() {
        if (drawing.visible && ctx) {
            ctx.save();

            ctx.fillStyle = drawing.style.color.neg;
            let temp = new Path2D();
            temp.addPath(geometry.neg, transformMatrix);
            ctx.fill(temp);

            ctx.fillStyle = drawing.style.color.pos
            temp = new Path2D();
            temp.addPath(geometry.pos, transformMatrix);
            ctx.fill(temp);

            ctx.restore()
        }
    }

    async function drawTooltip(
        globalX: number
    ) {
        // TODO: empty
    }

    function showStyle() {
        return (
            <div key={props.name}>
                <label htmlFor={'visible'}>{props.name}</label>
                <input
                    type={'checkbox'}
                    name={'visible'}
                    onChange={async (event) => {
                        drawing.dispatch((context) => {
                            context.drawings[props.name].visible = event.target.checked;
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
                                context.drawings[props.name].style.pos = event.target.value;
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
                                context.drawings[props.name].style.neg = event.target.value;
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
}
