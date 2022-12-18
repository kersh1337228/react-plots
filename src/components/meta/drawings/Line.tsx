import React from "react"
import {Point2D, TimeSeries, TimeSeriesArray, TimeSeriesObject} from "../types"
import Drawing from "./Drawing/Drawing"
import DrawingScalar from "./Drawing/DrawingScalar"
import DrawingVector from "./Drawing/DrawingVector"
import {plotDataType} from "../functions"

export interface LineStyle {
    color: string,
    width: number
}

// @ts-ignore
class LineBase<T extends Point2D | TimeSeries> extends Drawing<T> {
    public constructor(
        name: string,
        data: T[],
        style?: LineStyle
    ) {
        super(name, data)
        this.style = style ? style : {
            color: '#000000', width: 1
        }
    }
     // Drawing
    public async plot(): Promise<void> {
        const context = this.axes?.state.canvases.plot.ref.current?.getContext('2d')
        if (this.visible && context && this.axes) {
            context.save()
            // Coordinates transform
            context.translate(
                this.axes.state.axes.x.coordinates.translate,
                this.axes.state.axes.y.coordinates.translate
            )
            context.scale(
                this.axes.state.axes.x.coordinates.scale,
                -this.axes.state.axes.y.coordinates.scale
            )
            // Drawing
            context.beginPath()
            context.moveTo(0.55, this.data.observed.numeric[0])
            for (let i = 1; i < this.data_amount; ++i)
                context.lineTo(i + 0.55, this.data.observed.numeric[i])
            // Stroking
            context.restore()
            context.save()
            context.lineWidth = this.style.width * this.axes.state.canvases.plot.density
            context.strokeStyle = this.style.color
            context.stroke()
            context.closePath()
            context.restore()
        }
    }
    // Events
    public draw_tooltip(i: number): React.ReactNode {
        const context = this.axes?.state.canvases.tooltip.ref.current?.getContext('2d')
        if (context && this.axes) {  // Drawing circle
            context.save()
            context.beginPath()
            context.arc(
                (i + 0.55) * this.axes.state.axes.x.coordinates.scale,
                this.axes.state.axes.y.coordinates.translate -
                this.data.observed.numeric[i] *
                this.axes.state.axes.y.coordinates.scale,
                3 * this.axes.state.canvases.plot.density, 0, 2 * Math.PI
            )
            context.fillStyle = this.style.color
            context.fill()
            context.closePath()
            context.restore()
        } return
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
) {
    return plotDataType(data) === 'TimeSeriesObject' ?
        new LineVector(name, data as TimeSeriesObject[], style) :
        new LineScalar(name, data as Point2D[] | TimeSeriesArray[], style)
}
