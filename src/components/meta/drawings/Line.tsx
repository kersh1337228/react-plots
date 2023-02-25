import React from "react"
import Drawing from "./Drawing/Drawing"
import DrawingScalar from "./Drawing/DrawingScalar"
import DrawingVector from "./Drawing/DrawingVector"
import {plotDataType} from "../utils/functions/dataTypes"
import {Point2D, TimeSeries, TimeSeriesArray, TimeSeriesObject} from "../utils/types/plotData"

export interface LineStyle { color: string, width: number }

// @ts-ignore
class LineBase<T extends Point2D | TimeSeries> extends Drawing<T> {
    public constructor(name: string, data: T[], style?: LineStyle) {
        super(name, data)
        this.style = style ? style : { color: '#000000', width: 1 }
    }
    public async plot(): Promise<void> {
        if (this.axes) {
            const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
            const i0 = [...Array(this.data.observed.length).keys()].findIndex(i => this.point(i)[1] !== null)
            if (this.visible && context && i0 > -1) {
                context.save()
                // Coordinates transform
                context.translate(
                    this.axes.state.axes.x.coordinates.translate,
                    this.axes.state.axes.y.coordinates.translate
                )
                context.scale(
                    this.axes.state.axes.x.coordinates.scale,
                    this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                context.beginPath()
                context.moveTo(...this.point(i0) as [number, number])
                for (let i = i0 + 1; i < this.data_amount; ++i) {
                    const [x, y] = this.point(i)
                    if (y !== null) context.lineTo(x, y)
                }
                // Stroking
                context.resetTransform()
                context.lineWidth = this.style.width * this.axes.state.canvases.plot.density
                context.strokeStyle = this.style.color
                context.stroke()
                context.closePath()
                context.restore()
            }
        }
    }
    // Events
    public async draw_tooltip(i: number): Promise<void> {
        const [x, y] = this.point(i)
        if (this.axes && y) {
            const context = this.axes.state.canvases.tooltip.ref.current?.getContext('2d')
            if (context) {  // Drawing circle
                context.save()
                context.beginPath()
                context.arc(
                    x * this.axes.state.axes.x.coordinates.scale + this.axes.state.axes.x.coordinates.translate,
                    y * this.axes.state.axes.y.coordinates.scale + this.axes.state.axes.y.coordinates.translate,
                    3 * this.axes.state.canvases.plot.density,
                    0, 2 * Math.PI
                )
                context.fillStyle = this.style.color
                context.fill()
                context.closePath()
                context.restore()
            }
        }
    }
    public show_style(): React.ReactElement {
        return (
            <div key={this.name}>
                <label htmlFor={'visible'}>{this.name}</label>
                <input
                    type={'checkbox'}
                    name={'visible'}
                    onChange={async (event) => {
                        this.visible = event.target.checked
                        await this.axes?.recalculate_metadata(
                            this.axes.state.data_range
                        )
                    }}
                    defaultChecked={this.visible}
                />
                <ul>
                    <li>
                        Line color: <input
                        defaultValue={this.style.color}
                        onChange={async (event) => {
                            this.style.color = event.target.value
                            await this.axes?.plot()
                        }} type={'color'}/>
                    </li>
                    <li>
                        Line width: <input
                        type={'number'}
                        min={1} max={3} step={1}
                        defaultValue={this.style.width}
                        onChange={async (event) => {
                            this.style.width = event.target.valueAsNumber
                            await this.axes?.plot()
                        }}
                    />
                    </li>
                </ul>
            </div>
        )
    }
}

class LineScalar extends DrawingScalar(LineBase<Point2D | TimeSeriesArray>) {}
class LineVector extends DrawingVector(LineBase<TimeSeriesObject>) {}

export default function Line(
    name: string,
    data: Point2D[] | TimeSeries[],
    style?: LineStyle
): LineScalar | LineVector {
    return plotDataType(data) === 'TimeSeriesObject' ?
        new LineVector(name, data as TimeSeriesObject[], style) :
        new LineScalar(name, data as Point2D[] | TimeSeriesArray[], style)
}
