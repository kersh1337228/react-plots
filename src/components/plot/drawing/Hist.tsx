import { PlotData } from '../../../utils/types/plotData';
import { DrawingProps, useDrawing } from './base';
import React, { useContext, useMemo } from 'react';
import { AxesContext } from '../axes/Axes';

export declare type HistGeometryT = {
    pos: Path2D;
    neg: Path2D;
};

export declare type HistStyleT = {
    color: {
        pos: string;
        neg: string;
    };
    width: number
};

// class HistState<
//     DataT extends PlotData
// > extends Drawing<DataT, HistGeometryT, HistStyleT> {
//     public constructor(
//         data: DataT[],
//         name: string,
//         style: HistStyleT = { color: { pos: '#53e9b5', neg: '#da2c4d' } },
//         vfield?: string
//     ) {
//         super(
//             data,
//             { pos: new Path2D(), neg: new Path2D() },
//             name,
//             style,
//             vfield
//         );
//         const columnWidth = 0.9;
//         this.data.global.data.forEach((_, i) => {
//             const [x, y] = this.data.pointAt(i);
//             if (y) {
//                 const column = new Path2D();
//                 column.rect(x - columnWidth  / 2, 0, columnWidth , y);
//                 const type = y > 0 ? 'pos' : 'neg';
//                 this.geometry[type].addPath(column);
//             }
//         })
//     }
//
//     public override async plot(
//         ctx: CanvasRenderingContext2D
//     ) {
//         if (this.visible) {
//             ctx.save()
//             ctx.fillStyle = this.style.color.neg
//             // ctx.fill(this.axes.applyTransform(this.paths.neg))
//             ctx.fillStyle = this.style.color.pos
//             // ctx.fill(this.axes.applyTransform(this.paths.pos))
//             ctx.restore()
//         }
//     }
//
//     public async drawTooltip(
//         ctx: CanvasRenderingContext2D,
//         globalX: number,
//         xs: number,
//         xt: number,
//         ys: number,
//         yt: number,
//         density: number
//     ) {
//         // TODO: empty
//     }
//
//     public showStyle(): React.ReactElement {
//         return (
//             <div key={this.name}>
//                 <label htmlFor={'visible'}>{this.name}</label>
//                 <input type={'checkbox'} name={'visible'}
//                        onChange={async (event) => {
//                            this.visible = event.target.checked
//                            // this.axes.plot()
//                        }} defaultChecked={this.visible}
//                 />
//                 <ul>
//                     <li>Positive color: <input
//                         type={'color'} defaultValue={this.style.color.pos}
//                         onChange={async (event) => {
//                             this.style.color.pos = event.target.value
//                             // this.axes.plot()
//                         }}
//                     /></li>
//                     <li>Negative color: <input
//                         type={'color'} defaultValue={this.style.color.neg}
//                         onChange={async (event) => {
//                             this.style.color.neg = event.target.value
//                             // this.axes.plot()
//                         }}
//                     /></li>
//                 </ul>
//             </div>
//         )
//     }
// }

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
    name?: string,
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

    async function plot() {
        const { axesContext: {
            plotCtx: ctx,
            transformMatrix
        } } = useContext(AxesContext);
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
    {
        data,
        style,
        name,
        vfield
    }: DrawingProps<HistStyleT>
) {
    const hist = useHist(data, style, name, vfield);
    // TODO: add effects

    return null;
}
