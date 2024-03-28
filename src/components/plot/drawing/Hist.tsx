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

function useHist<
    DataT extends PlotData
> (
    data: DataT[],
    style: HistStyleT = {
        color: {
            pos: '#53e9b5',
            neg: '#da2c4d'
        },
        width: 0.9
    },
    name: string,
    vfield?: string
) {
    const drawing = useDrawing(
        data,
        style,
        name,
        vfield
    );

    const geometry = useMemo(() => {
        const hist = {
            pos: new Path2D(),
            neg: new Path2D()
        };
        data.forEach((_, i) => {
            const [x, y] = drawing.data.pointAt(i);
            if (y) {
                const column = new Path2D();
                column.rect(
                    x - drawing.state.style.width / 2, 0,
                    drawing.state.style.width, y
                );
                const type = y > 0 ? 'pos' : 'neg';
                hist[type].addPath(column);
            }
        });
        return hist;
    }, [drawing.state.style.width]);

    const {
        ctx: {
            plot: ctx
        },
        transformMatrix
    } = useContext(axesContext);
    async function plot() {
        if (drawing.state.visible && ctx) {
            ctx.save();

            ctx.fillStyle = drawing.state.style.color.neg;
            let temp = new Path2D();
            temp.addPath(geometry.neg, transformMatrix);
            ctx.fill(temp);

            ctx.fillStyle = drawing.state.style.color.pos
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
            <div key={name}>
                <label htmlFor={'visible'}>{name}</label>
                <input
                    type={'checkbox'}
                    name={'visible'}
                    onChange={async (event) => {
                        drawing.setState({
                            ...drawing.state,
                            visible: event.target.checked
                        });
                        // this.axes.plot() // TODO: full replot
                    }}
                    defaultChecked={drawing.state.visible}
                />
                <ul>
                    <li>Positive color: <input
                        type={'color'}
                        defaultValue={drawing.state.style.color.pos}
                        onChange={async (event) => {
                            drawing.setState({
                                ...drawing.state,
                                style: {
                                    ...drawing.state.style,
                                    color: {
                                        ...drawing.state.style.color,
                                        pos: event.target.value
                                    }
                                }
                            });
                            // this.axes.plot()
                        }}
                    /></li>
                    <li>Negative color: <input
                        type={'color'}
                        defaultValue={drawing.state.style.color.neg}
                        onChange={async (event) => {
                            drawing.setState({
                                ...drawing.state,
                                style: {
                                    ...drawing.state.style,
                                    color: {
                                        ...drawing.state.style.color,
                                        neg: event.target.value
                                    }
                                }
                            });
                            // this.axes.plot()
                        }}
                    /></li>
                </ul>
            </div>
        )
    }

    return {
        ...drawing,
        geometry,
        plot,
        drawTooltip,
        showStyle
    };
}

export default function Hist(
    props: DrawingProps<HistStyleT>
) {
    const hist = useHist(props.data, props.style, props.name, props.vfield);
    // TODO: add effects

    return null;
}
